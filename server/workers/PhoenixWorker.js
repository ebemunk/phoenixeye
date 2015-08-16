var debug = require('debug')('worker:PhoenixWorker');

var Promise = require('bluebird');

var child_process = require('child_process');
var fs = require('fs');

var config = require('../config.json');
var ORM = require('../includes/ORM.js');

function PhoenixWorker() {
	var self = this;

	this.orm = new ORM();

	return this.orm.init()
	.then(function (orm) {
		self.models = orm.collections;
		self.connections = orm.connections;

		return self;
	})
	.catch(function (err) {
		debug('fatal error', err);

		throw err;
	});
}

PhoenixWorker.prototype.destroy = function() {
	var self = this;

	return Promise.map(Object.keys(self.connections), function (connection) {
		return new Promise(function (resolve) {
			self.connections[connection]._adapter.teardown(null, resolve);
		});
	});
};

//construct job string (command call) from parameters
PhoenixWorker.prototype.getJobString = function(params, filePath, fileName) {
	var command = config.bin.phoenix;
	//-f filepath flag
	command += ' -f ' + filePath + '/' + fileName;
	//-o output path flag
	command += ' -o ' + filePath;
	//json flag
	command += ' -json';

	//error level analysis
	if( params.ela ) {
		command += ' -ela ' + params.ela.quality;
	}

	//avgdist
	if( params.avgdist ) {
		command += ' -avgdist';
	}

	//luminance gradient
	if( params.lg ) {
		command += ' -lg';
	}

	//hsv histogram
	if( params.hsv ) {
		command += ' -hsv ' + (params.hsv.whitebg ? '1' : '0');
	}

	//lab histogram
	if( params.labfast ) {
		command += ' -labfast ' + (params.labfast.whitebg ? '1' : '0');
	}

	//copy-move
	if( params.copymove ) {
		command += ' -copymove ' + params.copymove.retain + ' ' + params.copymove.qcoeff;
	}

	//autolevels
	if( params.autolevels ) {
		command += ' -autolevels';
	}

	return command;
};

// function saveAnalyses(imageId, output, callback) {
// 	//loop through analyses with async
// 	var analyses = Object.keys(output);
// 	async.each(
// 		analyses,
// 		function(key, callback) {
// 			//rename analysis file with param names
// 			var newFilePath = output[key].filename.split('.');
// 			var appendedParams = '';
// 			for( var param in output[key] ) {
// 				if( param == 'filename' ) continue;

// 				var paramVal = output[key][param]
// 				if( output[key][param] == 'true' || output[key][param] == 'false' ) {
// 					paramVal = output[key][param] ? '1' : '0';
// 				}

// 				appendedParams += '_' + paramVal;
// 			}
// 			var now = new Date();

// 			newFilePath[0] += appendedParams + '_' + now.getTime();
// 			newFilePath = newFilePath.join('.');
// 			fs.renameSync(output[key].filename, newFilePath);

// 			//construct new Analysis object
// 			var analysis = new Analysis();
// 			analysis.type = key;
// 			analysis.fileName = path.basename(newFilePath);
// 			analysis.path = path.dirname(newFilePath);
// 			analysis.path = path.relative(appRoot.toString(), analysis.path);
// 			analysis.params = output[key];
// 			analysis.imageId = imageId;

// 			//dont need the filename
// 			delete analysis.params.filename;

// 			debug('analysis:', analysis);

// 			Analysis.find(
// 				{type: analysis.type},
// 				null,
// 				{sort: {created: 'asc'}},
// 				function (err, existingAnalyses) {
// 					if( err ) return callback(err);

// 					debug('existing', existingAnalyses);
// 					//try to save analysis
// 					analysis.save(function(err) {
// 						if( err ) return callback(err);

// 						if( existingAnalyses.length > 2 ) {
// 							existingAnalyses[0].remove();
// 						}

// 						return callback();
// 					});
// 				}
// 			);
// 		},
// 		//something went wrong
// 		function(err) {
// 			if( err ) debug('error in analysis loop', err);

// 			return callback(err);
// 		}
// 	);
// }

//phoenix worker function - makes the call to phoenix & saves resulting analyses
PhoenixWorker.prototype.handleJob = function(params, callback) {
	debug('worker', params);

	var image;

	this.models.image.findOne({
		id: params.imageId
	})
	.then(function (img) {
		if( ! image ) {
			throw new Error('no image found with this id');
		}

		image = img;

		var jobString = getJobString(params, image.path, image.fileName);

		return Promise.fromNode(function (callback) {
			return child_process.exec(jobString, callback);
		});
	})
	.then(function (stdout, stderr) {
		return Promise.try(function () {
			return JSON.parse(stdout);
		});
	})
	.then(function (output) {
		//save estimates & qtables if available
		image.imagemagickQuality = output.imagick_estimate || image.imagick_estimate || null;
		image.hackerfactorQuality = output.hf_estimate || image.hf_estimate || null;
		image.qtables = output.qtables || image.qtables || null;
		return image.save();
	})
	.then(function (wot) {
		console.log('savin bro');
		// 	//remove img meta from output
		// 	delete output.hf_estimate;
		// 	delete output.imagick_estimate;
		// 	delete output.qtables;

		// 	saveAnalyses(image._id, output, function (err, saved) {
		// 		return callback(err);
		// 	});
	})
	.catch(function (err) {
		debug('error in job', err);
	});
};

module.exports = PhoenixWorker;