var debug = require('debug')('server:main');
var siteConfig = require('./config.json');

var Waterline = require('waterline');
var mongoAdapter = require('sails-mongo');
var memoryAdapter = require('sails-memory');

var Promise = require('bluebird');

var image = require('./models/image.js');
var analysis = require('./models/analysis.js');

function init() {
	var orm = new Waterline();

	var config = {
		adapters: {
			mongo: mongoAdapter,
			memory: memoryAdapter
		},
		connections: {
			'default': {
				adapter: 'memory'
			},
			memory: {
				adapter: 'memory'
			}
		}
	};

	if( process.env.NODE_ENV !== 'test' ) {
		config.connections.mongoLab = {
			adapter: 'mongo',
			url: siteConfig.dbString
		};

		config.connections['default'] = config.connections.mongoLab;
	}

	orm.loadCollection(image);
	orm.loadCollection(analysis);

	return Promise.fromNode(function (callback) {
		return orm.initialize(config, callback);
	});
}

module.exports = init;