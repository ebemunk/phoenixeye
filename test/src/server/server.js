process.env.NODE_ENV = 'test';

var chai = require('chai');
chai.should();

var supertest = require('supertest');

var Promise = require('bluebird');

var serverPath = '../../../server/';

describe('/api', function () {
	var app;
	var testServer;

	before(function (done) {
		require(serverPath + 'server.js')
		.then(function (express) {
			app = express;
			testServer = supertest(express);
			done();
		});
	});

	after(function () {
		app.listener.close();
		return app.orm.destroy();
	});

	describe('/', function () {
		it('should return uptime', function (done) {
			testServer
			.get('/api')
			.end(function (err, res) {
				res.status.should.equal(200);
				res.body.status.should.equal('running');
				res.body.should.have.property('uptime');
				done();
			});
		});
	});

	it('should return error message if theres an unexpected error', function (done) {
		testServer
		.post('/api/images/upload')
		.set('content-type', 'application/json')
		.send('wrong')
		.end(function (err, res) {
			res.body.should.have.property('error');
			done();
		});
	});
});

describe('/', function () {
	var app;
	var testServer;

	before(function (done) {
		require(serverPath + 'server.js')
		.then(function (express) {
			app = express;
			testServer = supertest(express);
			done();
		});
	});

	after(function () {
		app.listener.close();
		delete require.cache[require.resolve(serverPath + 'server.js')];

		return Promise.map(Object.keys(app.connections), function (connection) {
			return new Promise(function (resolve) {
				app.connections[connection]._adapter.teardown(null, resolve);
			});
		});
	});

	it('should return index.html for any non-matching route', function (done) {
		testServer
		.get('/test')
		.end(function (err, res) {
			res.text.should.contain('<!doctype html>');
			done();
		});
	});
});