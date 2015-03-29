var fs = require('fs');

var expect = require('chai').expect;
var supertest = require('supertest');

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var sinon = require('sinon');

var serverPath = '../../../../server/';

var Analysis = require(serverPath + 'models/analysis.js');

var server = require(serverPath + 'server.js').server;

var testServer = supertest(server);

describe('/api/analyses', function () {
	describe('/:imageId', function () {
		it('should return error if no analysis for imageId exists', function (done) {
			testServer
				.get('/api/analyses/5518037a4a767e9443ded758')
				.end(function(err, res) {
					expect(res.status).to.equal(200);
					expect(res.body).to.have.property('analyses');
					expect(res.body.analyses).to.be.an('array');
					expect(res.body.analyses).to.be.empty;

					done();
				});
		});

		it('should return analyses if imageId has them', function (done) {
			var unlinkStub = sinon.stub(fs, 'unlink');

			var randomId = mongoose.Types.ObjectId();;

			Analysis.create({
				imageId: randomId,
				path: 'mypath',
				fileName: 'fn'
			}, function (err, analysis) {
				testServer
					.get('/api/analyses/' + randomId)
					.end(function(err, res) {
						expect(res.status).to.equal(200);
						expect(res.body).to.have.property('analyses');
						expect(res.body.analyses).to.be.an('array');
						expect(res.body.analyses).to.not.be.empty;

						analysis.remove(function () {
							expect(unlinkStub.called).to.be.true;

							unlinkStub.restore();

							done();
						})
					});
			});
		})
	});
});