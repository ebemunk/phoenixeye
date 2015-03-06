var debug = require('debug')('server:routes:images');
var config = require('../config.json');

//router
var router = require('express').Router();

var jsonParser = require('body-parser').json();

//upload related
var Busboy = require('busboy');
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');

//model
var Image = require('../models/image.js');

//handle image upload
router.post('/upload', function (req, res, next) {
	//prepare busboy for upload
	var busboy = new Busboy({
		headers: req.headers,
		limits: {
			files: config.upload.maxFiles,
			fileSize: config.upload.sizeLimit
		}
	});

	//feed request to busboy
	req.pipe(busboy);

	//init image
	var uploadedImage = new Image();
	uploadedImage.tmpPath = path.join(appRoot.toString(), 'tmp', Date.now().toString() + Math.random().toString())
	uploadedImage.uploaderIP = req.ip || req.connection.remoteAddress;

	//to check if file limit is reached
	var fileLimitReached = false;

	//file handler
	busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
		debug('on file', fieldname, filename, encoding, mimetype);

		uploadedImage.file = file;
		uploadedImage.originalFileName = filename;

		//write upload to tmp folder
		var tmpFile = fs.createWriteStream(uploadedImage.tmpPath);
		file.pipe(tmpFile);
	});

	//file limit handler
	busboy.on('filesLimit', function () {
		debug('on file limit');
		fs.unlink(uploadedImage.tmpPath);
		fileLimitReached = true;
	});

	//upload is done
	busboy.on('finish', function () {
		//make sure to avoid sending resp > once
		if( res.headersSent ) {
			return;
		}

		debug('on upload finish', res.headersSent);

		//cry if more than 1 file submitted
		if( fileLimitReached ) {
			return res.status(400).json({error: 'only 1 file allowed'});
		}

		//cry if there was an error or file is too big
		if( ! uploadedImage.file ) {
			return res.status(500).json({error: 'error uploading the file'});
		} else if( uploadedImage.file.truncated ) {
			fs.unlink(uploadedImage.tmpPath);
			return res.status(400).json({error: 'file too big'});
		}

		debug('upload OK', uploadedImage);

		//get file size
		var fileStats = fs.statSync(uploadedImage.tmpPath);
		uploadedImage.fileSize = fileStats.size;

		//run file checks and start initial processing
		uploadedImage.fileChecks(function (err, image) {
			//cry if file checks fail
			if( err ) {
				return res.status(400).json({error: err.message});
			}

			if( ! image.duplicate ) {
				//run meta extraction
				uploadedImage.getMetadata(function () {});
				//run default analyses for the first time
				uploadedImage.queueAnalysis(config.defaultAnalysisOpts, function (err, job) {
					if( err ) return res.json({error: err});

					//respond to request
					res.json({
						image: image,
						jobId: job.data._id
					});
				});
			} else {
				res.json({
					image: image
				});
			}
		});
	});
});

//submit an analysis request to the job queue for an image
router.post('/analysis/:permalink', jsonParser, function (req, res, next) {
	debug('/images/analysis/:permalink');

	//try to get image by permalink
	Image.findOne(
		{
			permalink: req.params.permalink
		},
		function (err, image) {
			//cry
			if( err )
				return res.status(400).json({error: err.message});

			//more tears
			if( ! image )
				return res.status(400).json({error: 'no image found with this id ' + req.params.id});

			//get requesters ip just in case
			req.body.requesterIP = req.ip || req.connection.remoteAddress;

			//submit analysis request
			image.queueAnalysis(req.body, function (err, job) {
				if( err )
					return res.status(400).json({error: err.message});

				//return success
				res.json({
					success: true,
					jobId: job.data._id
				});
			});
		}
	);
});

//get an image by its permalink
router.get('/:permalink', function (req, res, next) {
	debug('/images/:permalink');

	//try to get image by permalink
	Image.findOne(
		{
			permalink: req.params.permalink
		},
		function (err, image) {
			//cry
			if( err )
				return res.status(500).json({error: err.message});

			//more tears
			if( ! image )
				return res.status(404).json({error: 'no image found with this id ' + req.params.id});

			//return image
			res.json({
				image: image
			});
		}
	);
});

module.exports = function() {
	return router;
}();