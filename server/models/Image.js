var debug = require('debug')('server:models:Image');

var Promise = require('bluebird');

var path = require('path');
var child_process = require('child_process');

var gm = require('gm').subClass({imageMagick: true});
var dataobjectParser = require('dataobject-parser');

var config = require('../includes/config.js');
var queue = require('../includes/queue.js');

module.exports = {
	identity: 'image',
	tableName: 'images',
	connection: 'default',
	migrate: 'safe',

	attributes: {
		//initial submission
		originalFileName: 'string',
		url: 'string',
		fileName: 'string',
		path: 'string',
		fileSize: 'integer',
		type: 'string',
		md5: 'string',
		size: 'json',
		permalink: 'string',
		uploaderIP: 'string',
		metaComplete: 'boolean',

		//imagemagick
		depth: 'json',
		imageStatistics: 'json',
		channelStatistics: 'json',
		gamma: 'string',
		chromaticity: 'json',

		//exiv2
		exif: 'json',
		iptc: 'json',
		xmp: 'json',

		//phoenix
		hackerfactorQuality: 'float',
		imagemagickQuality: 'float',
		qtables: 'json',

		analyses: {
			collection: 'analysis',
			via: 'image'
		},

		//instance methods
		filePath: function () {
			return path.join(this.path, this.fileName);
		},
		getGMInfo: function () {
			debug('Image.getGMInfo');

			var filePath = this.filePath();

			return Promise.fromNode(function (callback) {
				gm(filePath).identify(callback);
			});
		},
		getExiv2Info: function () {
			/*eslint no-unused-vars: 0*/

			debug('Image.getExiv2Info');

			var dotParser = new dataobjectParser();
			var filePath = this.filePath();

			return new Promise(function (resolve, reject) {
				child_process.exec('exiv2 -pa ' + filePath, function (err, stdout, stderr) {
					//handle exiv2 bug where it returns code 253 even when there is data
					if( err && ! (err.code == 253 && stdout) ) {
						return reject(err);
					}

					//parsing exiv2 output
					var lines = stdout.split(/\r?\n/);
					for( var i = 0; i < lines.length; i++ ) {
						if( ! lines[i] ) {
							continue;
						}

						var line = lines[i].replace(/\s+/g, ' ');
						var parsed = line.split(' ');

						var key = parsed[0];
						var value = parsed.slice(3).join(' ');
						dotParser.set(key, value);
					}

					return resolve(dotParser.data());
				});
			});
		},
		queueAnalysis: function(options) {
			debug('Image.queueAnalysis');

			options = options || {};
			var params = {};

			if( options.ela ) {
				var quality = options.ela.quality || config.defaultAnalysisOpts.ela.quality;
				//clamp it between [0-100]
				params.ela = {
					quality: Math.min(Math.max(quality, 0), 100)
				};
			}

			if( options.avgdist ) {
				params.avgdist = true;
			}

			if( options.lg ) {
				params.lg = true;
			}

			var whitebg;

			if( options.hsv ) {
				whitebg = (typeof options.hsv.whitebg == 'boolean' ? options.hsv.whitebg : config.defaultAnalysisOpts.hsv.whitebg);
				params.hsv = {whitebg: whitebg};
			}

			if( options.labfast ) {
				whitebg = (typeof options.labfast.whitebg == 'boolean' ? options.labfast.whitebg : config.defaultAnalysisOpts.labfast.whitebg);
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

			if( Object.keys(params).length < 1 ) {
				return Promise.reject(new Error('no valid params found'));
			}

			//job meta
			params.imageId = this.id;
			params.requesterIP = options.requesterIP || null;

			//put the job in the queue
			return Promise.fromNode(function (callback) {
				return queue.enqueue('phoenix', params, callback);
			})
			.then(function (job) {
				debug('enqueued', job.data._id);
				return job;
			});
		},

		//default instance overrides
		toJSON: function () {
			var obj = this.toObject();

			var doNotReturn = [
				'uploaderIP'
			];

			doNotReturn.forEach(function (key) {
				delete obj[key];
			});

			var qtables = {};
			for( var tableIndex in obj.qtables ) {
				qtables[tableIndex] = [];

				var qt = obj.qtables[tableIndex].split(',');
				while( qt.length ) {
					qtables[tableIndex].push(qt.splice(0,8));
				}
			}

			obj.qtables = qtables;

			return obj;
		}
	},

	//hooks
	afterCreate: function (img, next) {
		/*jshint -W069 */

		debug('Image.afterCreate');

		var image;

		this.findOne({
			permalink: img.permalink
		})
		.then(function (imageInstance) {
			image = imageInstance;

			return Promise.settle([image.getGMInfo(), image.getExiv2Info()]);
		})
		.spread(function (gmData, exiv2Data) {
			if( gmData.isFulfilled() ) {
				gmData = gmData.value();

				image.depth = gmData['Channel depth'] || null;
				image.channelStatistics = gmData['Channel statistics'] || null;
				image.imageStatistics = gmData['Image statistics'] ? gmData['Image statistics']['Overall'] : null;
				image.gamma = gmData.gamma;
				image.chromaticity = gmData['Chromaticity'] || null;
			}

			if( exiv2Data.isFulfilled() ) {
				exiv2Data = exiv2Data.value();

				image.exif = exiv2Data.Exif || null;
				image.xmp = exiv2Data.Xmp || null;
				image.iptc = exiv2Data.Iptc || null;
			}

			image.metaComplete = true;

			return image.save();
		})
		.finally(function () {
			next();
		});
	}
};