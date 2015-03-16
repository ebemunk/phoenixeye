var debug = require('debug')('worker:func:phoenix');

var path = require('path');
var child_process = require('child_process');
var fs = require('fs');

var async = require('async');
var appRoot = require('app-root-path');

var config = require('../config.json');
var Image = require('../models/image.js');
var Analysis = require('../models/analysis.js');

//construct job string (command call) from parameters
function getJobString(params, filePath, fileName) {
	var command = config.bin.phoenix;
	//-f filepath flag
	command += ' -f ' + path.join(appRoot.toString(), filePath, fileName);
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
}

function saveAnalyses(imageId, output, callback) {
	//loop through analyses with async
	var analyses = Object.keys(output);
	async.each(
		analyses,
		function(key, callback) {
			//rename analysis file with param names
			var newFilePath = output[key].filename.split('.');
			var appendedParams = '';
			for( var param in output[key] ) {
				if( param == 'filename' ) continue;

				var paramVal = output[key][param]
				if( output[key][param] == 'true' || output[key][param] == 'false' ) {
					paramVal = output[key][param] ? '1' : '0';
				}

				appendedParams += '_' + paramVal;
			}
			newFilePath[0] += appendedParams;
			newFilePath = newFilePath.join('.');
			fs.renameSync(output[key].filename, newFilePath);

			//construct new Analysis object
			var analysis = new Analysis();
			analysis.type = key;
			analysis.fileName = path.basename(newFilePath);
			analysis.path = path.dirname(newFilePath);
			analysis.path = path.relative(appRoot.toString(), analysis.path);
			analysis.params = output[key];
			analysis.imageId = imageId;

			//dont need the filename
			delete analysis.params.filename;

			debug('analysis:', analysis);

			Analysis.find(
				{type: analysis.type},
				null,
				{sort: {created: 'asc'}},
				function (err, existingAnalyses) {
					if( err ) return callback(err);

					//try to save analysis
					analysis.save(function(err) {
						if( err ) return callback(err);

						if( existingAnalyses.length > 2 ) {
							existingAnalyses[0].remove();
						}

						return callback();
					});
				}
			);
		},
		//something went wrong
		function(err) {
			if( err ) debug('error in analysis loop', err);

			return callback(err);
		}
	);
}

//phoenix worker function - makes the call to phoenix & saves resulting analyses
function workerFunc(params, callback) {
	debug('got job', params);

	try {
		Image.findOne({_id: params.imageId}, function (err, image) {
			if( err ) return callback(err);

			if( ! image ) return callback(new Error('Image not found??'));

			var jobString = getJobString(params, image.path, image.fileName);

			//call phoenix with the job cmd
			child_process.exec(jobString, function (err, stdout, stderr) {
				if( err ) return callback(err);

				try {
					var output = JSON.parse(stdout);
				} catch (err) {
					return callback(new Error('cannot parse phoenix output as json'));
				}

				//save estimates & qtables if available
				image.imagemagickQuality = output.imagick_estimate || image.imagick_estimate || null;
				image.hackerfactorQuality = output.hf_estimate || image.hf_estimate || null;
				image.qtables = output.qtables || image.qtables || null;
				image.save();

				//remove img meta from output
				delete output.hf_estimate;
				delete output.imagick_estimate;
				delete output.qtables;

				saveAnalyses(image._id, output, function (err, saved) {
					return callback(err);
				});
			});
		});
	} catch (err) {
		if( err ) debug('error while analyzing', err);

		return callback(err);
	}
}

module.exports = {
	getJobString: getJobString,
	workerFunc: workerFunc
};