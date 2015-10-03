var debug = require('debug')('server:main');

var ORM = require('./includes/ORM.js');

app.orm.init()
.then(function (models) {
	var models = models.collections;
	var connections = models.connections;
})
.catch(function (err) {
	console.log('fatal error', err);
});