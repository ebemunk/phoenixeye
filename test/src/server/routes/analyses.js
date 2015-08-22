process.env.NODE_ENV = 'test';

var chai = require('chai');
chai.should();

var sinon = require('sinon');
var supertest = require('supertest');

var fs = require('fs');

var Promise = require('bluebird');

var serverPath = '../../../../server/';

describe('/api/analyses', function () {
	var app;
	var testServer;
	var models;
	var unlinkStub;

	before(function (done) {
		unlinkStub = sinon.stub(fs, 'unlink').callsArgWith(1, true);

		require(serverPath + 'server.js')
		.then(function (express) {
			app = express;
			models = app.models;
			testServer = supertest(express);
			done();
		});
	});

	after(function () {
		unlinkStub.restore();
		app.listener.close();
	});

	afterEach(function () {
		return Promise.map(Object.keys(models), function (model) {
			return models[model].destroy({});
		});
	});

	describe('/:imageId', function () {
		it('should return analyses if imageId has them', function (done) {
			var randomId = 123;

			models.analysis.create({
				imageId: randomId,
				path: 'mypath',
				fileName: 'fn'
			})
			.then(function (analysis) {
				testServer
				.get('/api/analyses/' + randomId)
				.end(function (err, res) {
					res.status.should.equal(200);
					res.body.should.be.an('array');
					res.body.should.not.be.empty;

					done();
				});
			});
		});
	});
});