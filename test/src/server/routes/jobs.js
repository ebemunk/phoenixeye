process.env.NODE_ENV = 'test';

var chai = require('chai');
chai.should();

var sinon = require('sinon');
var supertest = require('supertest');

var fs = require('fs');

var Promise = require('bluebird');

var serverPath = '../../../../server/';

describe('/api/jobs', function () {
	var app;
	var testServer;
	var models;

	before(function (done) {
		require(serverPath + 'server.js')
		.then(function (express) {
			app = express;
			models = app.models;
			testServer = supertest(express);
			done();
		});
	});

	afterEach(function () {
		return Promise.map(Object.keys(models), function (model) {
			return models[model].destroy({});
		});
	});

	describe('/:jobId', function () {
		it('should return error if no jobId exists', function (done) {
			testServer
			.get('/api/jobs/zzz')
			.end(function (err, res) {
				res.status.should.equal(404);

				done();
			});
		});

		it('should return job if it exists', function (done) {
			var randomId = 123;

			models.job.create({
				id: randomId
			})
			.then(function (job) {
				testServer
				.get('/api/jobs/' + randomId)
				.end(function (err, res) {
					res.status.should.equal(200);
					res.body.should.have.property('job');
					res.body.job.should.be.an('object');

					done();
				});
			});
		});
	});
});