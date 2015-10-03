var debug = require('debug')('server:main');

var ORM = require('./includes/ORM.js');

new ORM.init()
.then(function (models) {
	/*eslint no-console: 0*/

	// models.collections
	// models.connections
	debug(models);
})
.catch(function (err) {
	console.log('fatal error', err);
});