var debug = require('debug')('worker:phoenix');
var config = require('./config.json');

var client = require('monq')(config.dbString);
var worker = client.worker(['phoenix']);

var phoenixWorker = require('./workers/phoenix.js');

//connect to mongo
var mongoose = require('mongoose');
mongoose.connect(config.dbString);
mongoose.connection.on('error', function mongoError(err) {
	debug('Cannot connect to mongo', err);
});
mongoose.connection.once('open', function mongooseOpen() {
	debug('Connected to mongo');
});

//register the worker function
worker.register({
	phoenix: phoenixWorker.workerFunc
});

worker.start();
debug('worker started');