var debug = require('debug')('worker:phoenix');
var config = require('./includes/config.js');

var monq = require('monq')(config.dbString);
var worker = monq.worker(['phoenix']);

var PhoenixWorker = require('./workers/PhoenixWorker.js');

var rollbar = require('rollbar');
rollbar.init(config.analytics.rollbar.serverToken, {
	environment: config.env,
	endpoint: 'https://api.rollbar.com/api/1/'
});
rollbar.handleUncaughtExceptions();

new PhoenixWorker()
.then(function (phoenixWorker) {
	//register the worker function
	worker.register({
		phoenix: phoenixWorker.handleJob.bind(phoenixWorker)
	});

	worker.start();

	debug('worker started');
})
.catch(function (err) {
	debug('fatal error', err);
	throw err;
});