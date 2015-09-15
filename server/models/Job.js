/*eslint no-unused-vars: 0*/

var debug = require('debug')('server:models:Job');

module.exports = {
	identity: 'job',
	tableName: 'jobs',
	connection: 'default',
	migrate: 'safe',
	autoCreatedAt: false,
	autoUpdatedAt: false,

	attributes: {
		name: 'string',
		params: {
			imageId: {
				model: 'image'
			}
		},
		queue: 'string',
		attempts: 'integer',
		timeout: 'integer',
		delay: 'date',
		priority: 'integer',
		status: 'string',
		enqueued: 'date',
		dequeued: 'date',
		ended: 'date',
		error: 'string',
		stack: 'string',

		//default instance overrides
		toJSON: function () {
			var obj = this.toObject();

			var doNotReturn = [
				'requesterIP'
			];

			doNotReturn.forEach(function (key) {
				delete obj[key];
			});

			return obj;
		}
	}
};