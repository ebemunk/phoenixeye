var debug = require('debug')('server:queue');
var config = require('./config.json');

var monq = require('monq');
var monqConn;

//this is kinda sad but i cant find any other way to mock it in tests
if( process.env.NODE_ENV === 'test' ) {
	monqConn = {
		queue: function () {
			return {
				enqueue: function (queue, params, callback) {
					return callback(null, {
						data: {
							_id: Math.random(),
							params: params
						}
					});
				}
			}
		}
	};
} else {
	monqConn = monq(config.dbString);
}

var queue = monqConn.queue('phoenix');

module.exports = queue;