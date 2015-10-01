var debug = require('debug')('server:models:SubmittedFile');
var config = require('../includes/config.js');

var Promise = require('bluebird');

var exec = Promise.promisify(require('child_process').exec);
var fs = Promise.promisifyAll(require('fs'));

var imageSize = Promise.promisify(require('image-size'));
var md5file = Promise.promisify(require('md5-file'));
var shortId = require('shortid');

var HTTPError = require('node-http-error');

function SubmittedFile() {
	this.tmpPath = 'tmp/' + Date.now().toString() + '_' + Math.random().toString();
}

//remove file from temporary location
SubmittedFile.prototype.unlink = function () {
	debug('SubmittedFile.prototype.unlink');

	return fs.unlinkAsync(this.tmpPath);
};

//check image mime type using `file` command
SubmittedFile.prototype.checkType = function () {
	debug('SubmittedFile.prototype.checkType');

	return exec('file --mime-type ' + this.tmpPath)
	.spread(function (stdout, stderr) {
		//parse mime from the output
		var mime = stdout.match(/.*: (.*)/)[1];

		debug('`file`', stdout, stderr, mime);

		//check if file type is allowed
		if( ! config.upload.acceptedTypes[mime] ) {
			debug('file type not accepted');
			throw new HTTPError(415, 'file type not accepted');
		}

		return config.upload.acceptedTypes[mime];
	})
	.catch(function (err) {
		debug('error', err);
		throw err;
	});
};

//check if file dimensions exceed max allowed
SubmittedFile.prototype.checkDims = function() {
	debug('SubmittedFile.prototype.checkDims');

	//get image size and calculate area
	return imageSize(this.tmpPath)
	.then(function (dimensions) {
		var mp = dimensions.width * dimensions.height;

		if( mp > config.upload.maxDims ) {
			throw new HTTPError(413, 'file dimensions too big');
		}

		return {
			width: dimensions.width,
			height: dimensions.height
		};
	})
	.catch(function (err) {
		debug('error', err);
		throw err;
	});
};

//calculate file md5 and check if it already exists in db
SubmittedFile.prototype.checkMD5 = function(imageModel) {
	debug('SubmittedFile.prototype.checkMD5');

	var fileMd5;

	return md5file(this.tmpPath)
	.then(function (md5) {
		fileMd5 = md5;
		return imageModel.findOne({md5: md5});
	})
	.then(function (image) {
		if( ! image ) {
			return fileMd5;
		}

		image.duplicate = true;
		return image;
	})
	.catch(function (err) {
		debug('error', err);
		throw err;
	});
};

//do file checks for acceptance and save if valid
SubmittedFile.prototype.fileChecks = function(imageModel) {
	debug('SubmittedFile.prototype.fileChecks');

	var self = this;

	//image data to save
	var image = {};

	return this.checkType()
	.then(function (type) {
		image.type = type;

		return self.checkDims();
	})
	.then(function (dimensions) {
		image.size = dimensions;

		return fs.statAsync(self.tmpPath);
	})
	.then(function (fileStats) {
		image.fileSize = fileStats.size;

		if( image.fileSize > config.upload.sizeLimit ) {
			throw new HTTPError(413, 'file too big');
		}

		return self.checkMD5(imageModel);
	})
	.then(function (imageOrMd5) {
		if( typeof imageOrMd5 === 'object' ) {
			//duplicate found, remove tmp file and return image
			self.unlink();
			image = imageOrMd5;
			return image;
		}

		image.permalink = shortId.generate();
		image.md5 = imageOrMd5;
		image.path = 'images/' + image.permalink;
		image.fileName = image.permalink + '.' + image.type;

		image.originalFileName = self.originalFileName;
		image.url = self.url;
		image.uploaderIP = self.uploaderIP;

		//create folder for image
		return fs.mkdirAsync(image.path)
		//move file from tmp to its own folder
		.then(function () {
			return fs.renameAsync(self.tmpPath, image.path + '/' + image.fileName);
		})
		//save
		.then(function () {
			return imageModel.create(image);
		});
	})
	.catch(function (err) {
		debug('error', err);
		self.unlink();
		throw err;
	});
};

module.exports = SubmittedFile;