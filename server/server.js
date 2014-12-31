var debug = require('debug')('server:main');
var config = require('./config.json');

var express = require('express');

//connect to mongo
var mongoose = require('mongoose');
mongoose.connect(config.dbString);
mongoose.connection.on('error', function mongoError(err) {
	debug('Cannot connect to mongo', err);
});
mongoose.connection.once('open', function mongooseOpen() {
	debug('Connected to mongo');
});

//init app
var app = express();
app.enable('trust proxy');
app.disable('x-powered-by');

//return api uptime
app.get('/api', function(req, res) {
	res.json({
		status: 'running',
		uptime: process.uptime()
	});
});

//routes
app.use('/api/images', require('./routes/images'));

//init
var server = app.listen(config.port, function() {
	debug('server running on port ' + config.port);
});

//export server for testing
module.exports.server = server;