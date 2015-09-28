/*eslint-env node*/
/*eslint no-unused-vars: 0*/

var debug = require('debug')('server:main');
var config = require('./config.json');

var express = require('express');
var compression = require('compression');

var ORM = require('./includes/ORM.js');

//init app
var app = express();
app.enable('trust proxy');
app.disable('x-powered-by');
app.use(compression({
	threshold: 0
}));

//return api uptime
app.get('/api', function (req, res) {
	res.json({
		status: 'running',
		uptime: process.uptime()
	});
});

//routes
app.use('/api/images', require('./routes/images.js'));
app.use('/api/analyses', require('./routes/analyses.js'));
app.use('/api/jobs', require('./routes/jobs.js'));

//static files
app.use('/images', express.static('images', {index: 'false'}));
app.use('/img', express.static('client/img', {index: 'false'}));
app.use(express.static('client/dist'));

//redirect anything else to index.html
app.use('/*', function indexRedirect(req, res, next) {
	res.sendFile('client/index.html', {root: __dirname + '/../'});
});

//error handler
app.use(function errorHandler(err, req, res, next) {
	res.status(err.status || 500).json({
		error: err.message,
		stack: err.stack
	});
});

app.orm = new ORM();

module.exports = app.orm.init()
.then(function (models) {
	/*eslint no-console: 0*/

	app.models = models.collections;
	app.connections = models.connections;

	if( require.main === module ) {
		app.listener = app.listen(config.port, function () {
			debug('server running on port ' + config.port);
			console.log('phoenixeye server running at:', config.port);
		});	
	}

	return app;
})
.catch(function (err) {
	console.log('fatal error', err);
});