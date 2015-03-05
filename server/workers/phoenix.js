var debug = require('debug')('worker:func:phoenix');
var path = require('path');
var child_process = require('child_process');
var async = require('async');

var config = require('../config.json');
var Image = require('../models/image.js');
var Analysis = require('../models/analysis.js');

//construct job string (command call) from parameters
function getJobString(params, filePath, fileName) {
	var command = config.bin.phoenix;
	//-f filepath flag
	command += ' -f ' + path.join(filePath, fileName);
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

				var output = JSON.parse(stdout);

				if( ! output )
					return callback(new Error('cannot parse phoenix output as json'));

				debug('phoenix', output);

				//save estimates & qtables if available
				image.imagemagickQuality = output.imagick_estimate || image.imagick_estimate || null;
				image.hackerfactorQuality = output.hf_estimate || image.hf_estimate || null;
				image.qtables = output.qtables || image.qtables || null;
				image.save();

				//remove img meta from output
				delete output.hf_estimate;
				delete output.imagick_estimate;
				delete output.qtables;

				//loop through analyses with async
				var analyses = Object.keys(output);
				async.each(
					analyses,
					function(key, callback) {
						//construct new Analysis object
						var analysis = new Analysis();
						analysis.type = key;
						analysis.fileName = path.basename(output[key].filename);
						analysis.path = path.dirname(output[key].filename);
						analysis.params = output[key];
						//dont need the filename
						delete analysis.params.filename;

						debug('analysis:', analysis);

						//try to save analysis
						analysis.save(function(err) {
							return callback(err);
						});
					},
					//something went wrong
					function(err) {
						if( err ) debug('error in analysis loop', err);

						return callback(err);
					}
				);
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