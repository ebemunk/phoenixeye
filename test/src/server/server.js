var expect = require('chai').expect;
var request = require('supertest');

var serverPath = '../../../server/';
var server = require(serverPath + 'server.js').server;

var testServer = request(server);

describe('/api', function () {
	describe('/', function () {
		it('should return uptime', function (done) {
			testServer
				.get('/api')
				.end(function (err, res) {
					expect(res.status).to.equal(200);
					expect(res.body.status).to.equal('running');
					expect(res.body).to.have.property('uptime');
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
				expect(res.body).to.have.property('error');
				done();
			});
	});
});

describe('/', function () {
	it('should return index.html for any non-matching route', function (done) {
		testServer
			.get('/test')
			.end(function (err, res) {
				expect(res.text).to.contain('<!doctype html>');
				done();
			});
	});
});