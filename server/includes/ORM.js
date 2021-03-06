/*eslint no-unused-vars: 0*/

var debug = require('debug')('server:ORM');
var config = require('./config.js');

var Waterline = require('waterline');
var mongoAdapter = require('sails-mongo');
var memoryAdapter = require('sails-memory');

var Promise = require('bluebird');

var Image = require('../models/Image.js');
var Analysis = require('../models/Analysis.js');
var Job = require('../models/Job.js');

function ORM() {
	this.orm = new Waterline();
	this.config = {
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
		this.config.connections.mongoLab = {
			adapter: 'mongo',
			url: config.dbString
		};

		this.config.connections['default'] = this.config.connections.mongoLab;
	}

	this.orm.loadCollection(Waterline.Collection.extend(Image));
	this.orm.loadCollection(Waterline.Collection.extend(Analysis));
	this.orm.loadCollection(Waterline.Collection.extend(Job));
}

ORM.prototype.init = function () {
	var self = this;

	return Promise.fromNode(function (callback) {
		return self.orm.initialize(self.config, callback);
	});
};

ORM.prototype.destroy = function() {
	var self = this;

	return Promise.map(Object.keys(self.orm.connections), function (connection) {
		return new Promise(function (resolve) {
			self.orm.connections[connection]._adapter.teardown(null, resolve);
		});
	});
};

module.exports = ORM;