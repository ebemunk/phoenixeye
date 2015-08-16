var debug = require('debug')('worker:phoenix');
var config = require('./config.json');

var monq = require('monq')(config.dbString);
var worker = monq.worker(['phoenix']);

var PhoenixWorker = require('./workers/PhoenixWorker.js');

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