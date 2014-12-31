var debug = require('debug')('server:models:image');
var config = require('../config.json');

//io operations
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

//utility
var async = require('async');
var shortId = require('shortid');

//db
var mongoose = require('mongoose');

//image metadata stuff
var md5file = require('md5-file');
var imageSize = require('image-size');
var dataobjectParser = require('dataobject-parser');
var gm = require('gm').subClass({ imageMagick: true });

//queue
var queue = require('monq')(config.dbString).queue('phoenix');

var Image = mongoose.model('Image', require('./imageSchema.js'));

//check image mime type using `file` command
Image.prototype.checkType = function(callback) {
	debug('Image.prototype.checkType');

	var self = this;

	//call `file`
	var child = child_process.exec(
		'file --mime-type ' + this.tmpPath,
		function (err, stdout, stderr) {
			//cry if error
			if( err ) {
				debug('error calling `file`', err);
				return callback(new Error('error calling `file`'));
			}

			//parse mime from the output
			var mime = stdout.match(/.*: (.*)/)[1];

			debug('`file`', err, stdout, stderr, mime);

			//check if file type is allowed
			if( ! config.upload.acceptedTypes[mime] ) {
				debug('file type not accepted');
				return callback(new Error('file type not accepted'));
			} else {
				//return mime extension if valid
				debug('file type ok', mime);
				return callback(null, config.upload.acceptedTypes[mime]);
			}
		}
	);
};

//check if file dimensions exceed max allowed
Image.prototype.checkDims = function(callback) {
	debug('Image.prototype.checkDims');

	//get image size and calculate megapixels
	var dimensions = imageSize(this.tmpPath);
	var mp = dimensions.width * dimensions.height;

	//cry if image is too large
	if( mp > config.upload.maxDims ) {
		callback(new Error('file dimensions too big'));
	} else {
		//return dimensions if valid
		callback(null, dimensions);
	}
};

//calculate file md5 and check if it already exists in db
Image.prototype.checkMD5 = function(callback) {
	debug('Image.prototype.checkMD5');

	var md5 = md5file(this.tmpPath);

	var self = this;

	//check if we have this md5 in db
	Image.findOne({md5: md5}, function(err, image) {
		//cry if error
		if( err ) {
			return callback(err);
		}

		if( image ) {
			//image already exists, return data
			debug('image found');
			callback(null, image);
		} else {
			//new image, return md5
			debug('image not found');
			callback(null, md5);
		}
	});
};

//do file checks for acceptance
Image.prototype.fileChecks = function(callback) {
	debug('Image.prototype.fileChecks');

	var self = this;

	//avoiding callback hell
	async.series(
		[
			//this .bind stuff is lame
			self.checkType.bind(self),
			self.checkDims.bind(self),
			self.checkMD5.bind(self)
		],
		function (err, results) {
			//error in one of the checks, cry
			if( err ) {
				fs.unlink(self.tmpPath);
				return callback(err);
			}

			//results[0] contains mime type
			//results[1] contains dimensions
			//results[2] contains md5 OR existing image
			self.type = results[0];
			self.size = results[1];

			//duplicate found, return info
			if( typeof results[2] == 'object' ) {
				fs.unlink(self.tmpPath);
				var duplicate = results[2].toObject();
				//add duplicate flag for info
				duplicate.duplicate = true;
				return callback(null, duplicate);
			}

			//assign more properties
			self.md5 = results[2];
			self.path = path.join('../images', self.md5);
			self.fileName = self.md5 + '.' + self.type;
			var filePath = path.join(self.path, self.fileName);
 			self.permalink = shortId.generate();

			//this really shouldn't be the case, but what the heck
			if( ! fs.existsSync(self.path) ) {
				fs.mkdirSync(self.path);
			}
			//move file from tmp to its own folder
			fs.renameSync(self.tmpPath, filePath);

			//save to db
			self.save(function (error, image) {
				if( error ) {
					return callback(error);
				}

				return callback(null, image);
			});
		}
	);
};

//call exiv2 and parse metadata results
Image.prototype.getExiv2Info = function(callback) {
	debug('Image.prototype.getExiv2Info');

	var self = this;

	var filePath = path.join(this.path, this.fileName);
	var dotParser = new dataobjectParser();

	var child = child_process.exec(
		'exiv2 -pa ' + filePath,
		function (err, stdout, stderr) {
			//cry if error
			if( err ) {
				//some weird bug causes exiv2 to return -253 code
				//even when some data is found
				if( ! (err.code == 253 && stdout) ) {
					debug('error calling `exiv2 -pa`', err);
					//async doesnt like errors in .parallel
					return callback(null, {});
				}
			}

			//parsing exiv2 output
			var lines = stdout.split(/\r?\n/);
			for( var i = 0; i < lines.length; i++ ) {
				if( ! lines[i] ) continue;

				var line = lines[i].replace(/\s+/g, ' ');
				var parsed = line.split(' ');

				var key = parsed[0];
				var value = parsed.slice(3).join(' ');
				dotParser.set(key, value);
			}

			var exiv2data = dotParser.data();

			callback(null, exiv2data);
		}
	);
};

//call gm (imagemagick) and get metadata
Image.prototype.getGMInfo = function(callback) {
	debug('Image.prototype.getGMInfo');

	var self = this;

	var filePath = path.join(this.path, this.fileName);

	gm(filePath).identify(function (err, gmdata) {
		if( err ) return callback(null, {});

		callback(null, gmdata);
	});
};

//extract both types of metadata and save details
Image.prototype.getMetadata = function(callback) {
	debug('Image.prototype.getMetadata');

	var self = this;

	async.parallel(
		[
			//this .bind stuff is lame
			self.getExiv2Info.bind(self),
			self.getGMInfo.bind(self)
		],
		function (err, results) {
			//error in one of the checks, cry
			if( err ) {
				return callback(err);
			}

			//assign exiv2 data
			self.exif = results[0].Exif || null;
			self.xmp = results[0].Xmp || null;
			self.iptc = results[0].Iptc || null;

			//assign imagemagick data
			self.depth = results[1]['Channel depth'] || null;
			self.channelStatistics = results[1]['Channel statistics'] || null;
			self.imageStatistics = (results[1]['Image statistics'] ? results[1]['Image statistics']['Overall'] : null);
			self.gamma = results[1].gamma;
			self.chromaticity = results[1]['Chromaticity'] || null;

			self.metaComplete = true;

			self.save(function (error, image) {
				if( error ) {
					return callback(error);
				}

				return callback(null, image);
			});
		}
	);
};

//save analysis requests to queue
Image.prototype.queueAnalysis = function(options, callback) {
	options = options || {};
	var params = {};

	if( options.ela ) {
		var quality = options.ela.quality || config.defaultAnalysisOpts.ela.quality;
		//clamp it between [0-100]
		params.ela = {
			quality: Math.min(Math.max(quality, 0), 100)
		}
	}

	if( options.avgdist ) {
		params.avgdist = true;
	}

	if( options.lg ) {
		params.lg = true;
	}

	if( options.hsv ) {
		var whitebg = (typeof options.hsv.whitebg == 'boolean' ? options.hsv.whitebg : config.defaultAnalysisOpts.hsv.whitebg);
		params.hsv = {whitebg: whitebg};
	}

	if( options.labfast ) {
		var whitebg = (typeof options.labfast.whitebg == 'boolean' ? options.labfast.whitebg : config.defaultAnalysisOpts.labfast.whitebg);
		params.labfast = {whitebg: whitebg};
	}

	if( options.copymove ) {
		var retain = options.copymove.retain || config.defaultAnalysisOpts.copymove.retain;
		var qcoeff = options.copymove.qcoeff || config.defaultAnalysisOpts.copymove.qcoeff;

		params.copymove = {
			//clamp between [1,16]
			retain: Math.min(Math.max(retain, 1), 16),
			//make sure > 1
			qcoeff: Math.max(qcoeff, 1)
		};
	}

	if( options.autolevels ) {
		params.autolevels = true;
	}

	if( Object.keys(params).length < 1 )
		return callback(new Error('no valid params found'));

	//job meta
	params.imageId = this.id;
	params.requesterIP = options.requesterIP || null;

	//put the job in the queue
	queue.enqueue('phoenix', params, function (err, job) {
		if( err ) return callback(err);

		debug('enqueued', job.data._id);
		return callback(null, job);
	});
};

// Image.prototype.requestAnalysis = function(options) {
// 	// options = options || config.defaultAnalysisOpts;

// 	var command = 'phoenix';
// 	//-f filepath flag
// 	command += ' -f ' + path.join(this.path, this.fileName);
// 	//-o output path flag
// 	command += ' -o ' + this.path;
// 	//json flag
// 	command += ' -json';

// 	if( options.ela ) {
// 		var quality = options.ela.quality || config.defaultAnalysisOpts.ela.quality;
// 		//clamp it between [0-100]
// 		quality = Math.min(Math.max(quality, 0), 100);
// 		command += ' -ela ' + quality;
// 	}

// 	if( options.avgdist ) {
// 		command += ' -avgdist';
// 	}

// 	if( options.lg ) {
// 		command += ' -lg';
// 	}

// 	if( options.hsv ) {
// 		var whitebg = typeof options.hsv.whitebg == 'bool' || config.defaultAnalysisOpts.hsv.whitebg;
// 		command += ' -hsv ' + (whitebg ? '0' : '1');
// 	}
// 	console.log('FAF', command);

// };

module.exports = Image;