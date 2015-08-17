var debug = require('debug')('server:models:Analysis');

var path = require('path');
var fs = require('fs');

var Promise = require('bluebird');

module.exports = {
	identity: 'analysis',
	tableName: 'analyses',
	connection: 'default',
	migrate: 'safe',

	attributes: {
		//data
		type: 'string',
		fileName: 'string',
		path: 'string',
		params: 'json',

		image: {
			model: 'image'
		},

		//meta
		requesterIP: 'string'
	},

	afterDestroy: function (deleted, next) {
		debug('Analysis.afterDestroy');

		return Promise.map(deleted, function (analysis) {
			return Promise.fromNode(function (callback) {
				return fs.unlink(path.join(analysis.path, analysis.fileName), callback);
			});
		})
		.finally(function () {
			next();
		});
	}
};