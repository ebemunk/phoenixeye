var debug = require('debug')('server:models:analysis');

var Promise = require('bluebird');

var path = require('path');
var child_process = require('child_process');

var gm = require('gm').subClass({imageMagick: true});
var dataobjectParser = require('dataobject-parser');

var Waterline = require('waterline');

var analysis = Waterline.Collection.extend({
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
	}
});

module.exports = analysis;