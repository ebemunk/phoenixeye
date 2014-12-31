var expect = require('chai').expect;
var request = require('supertest');

var server = require('../../server.js').server;

var testServer = request(server);

describe('/api', function () {
	this.timeout(5000);

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
});