var debug = require('debug')('worker:PhoenixWorker');

var Promise = require('bluebird');

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

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

PhoenixWorker.prototype.saveAnalyses = function(imageId, output) {
	var self = this;
	var analyses = Object.keys(output);
	var existingAnalyses;

	return Promise.map(analyses, function (key) {
		//rename analysis file with param names
		var newFilePath = output[key].filename.split('.');
		var appendedParams = '';

		for( var param in output[key] ) {
			if( param == 'filename' ) {
				continue;
			}

			var paramVal = output[key][param]
			if( output[key][param] == 'true' || output[key][param] == 'false' ) {
				paramVal = output[key][param] ? '1' : '0';
			}

			appendedParams += '_' + paramVal;
		}

		var now = new Date();

		newFilePath[0] += appendedParams + '_' + now.getTime();
		newFilePath = newFilePath.join('.');
		fs.renameSync(output[key].filename, newFilePath);

		//construct new Analysis object
		var analysis = {};
		analysis.type = key;
		analysis.fileName = path.basename(newFilePath);
		analysis.path = path.dirname(newFilePath);
		analysis.path = path.relative(__dirname, analysis.path);
		analysis.params = output[key];
		analysis.imageId = imageId;

		//dont need the filename
		delete analysis.params.filename;

		debug('analysis:', analysis);

		return self.models.analysis.find({
			where: {
				type: analysis.type
			},
			sort: 'createdAt asc'
		})
		.then(function (analyses) {
			debug('existing', analyses);
			existingAnalyses = analyses;

			//try to save analysis
			return self.models.analysis.create(analysis);
		})
		.then(function (analysis) {
			if( existingAnalyses.length > 2 ) {
				existingAnalyses[0].destroy();
			};

			return analysis;
		});
	});
};

//phoenix worker function - makes the call to phoenix & saves resulting analyses
PhoenixWorker.prototype.handleJob = function(params, callback) {
	debug('worker', params);

	var self = this;
	var image;
	var output;

	return this.models.image.findOne({
		id: params.imageId
	})
	.then(function (img) {
		if( ! img ) {
			throw new Error('no image found with this id');
		}

		image = img;

		var jobString = self.getJobString(params, image.path, image.fileName);

		return Promise.fromNode(function (callback) {
			return child_process.exec(jobString, callback);
		});
	})
	.spread(function (stdout, stderr) {
		return Promise.try(function () {
			return JSON.parse(stdout);
		});
	})
	.then(function (jsonOutput) {
		output = jsonOutput;

		//save estimates & qtables if available
		image.imagemagickQuality = output.imagick_estimate || image.imagick_estimate || null;
		image.hackerfactorQuality = output.hf_estimate || image.hf_estimate || null;
		image.qtables = output.qtables || image.qtables || null;
		return image.save();
	})
	.then(function (img) {
		image = img;

		//remove img meta from output
		delete output.hf_estimate;
		delete output.imagick_estimate;
		delete output.qtables;

		return self.saveAnalyses(image.id, output);
	})
	.catch(function (err) {
		debug('error in job', err);
		throw err;
	})
	.nodeify(callback);
};

module.exports = PhoenixWorker;