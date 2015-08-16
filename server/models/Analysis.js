var debug = require('debug')('server:models:Analysis');

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
	}
};