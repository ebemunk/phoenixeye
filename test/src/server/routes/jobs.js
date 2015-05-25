var expect = require('chai').expect;
var request = require('supertest');

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var serverPath = '../../../../server/';
var Job = require(serverPath + 'models/job.js');
var server = require(serverPath + 'server.js').server;

var testServer = request(server);

describe('/api/jobs', function () {
	describe('/:id', function () {
		var jobId;

		before(function (done) {
			Job.create({
				name: 'test'
			}, function (err, job) {
				jobId = job._id;
				done();
			});
		});

		it('should return error if id is invalid', function (done) {
			testServer
				.get('/api/jobs/wrong')
				.expect(400, done);
		});

		it('should return error if id doesnt exist', function (done) {
			testServer
				.get('/api/jobs/' + mongoose.Types.ObjectId())
				.expect(404, done);
		});

		it('should return job data if id exists', function (done) {
			testServer
				.get('/api/jobs/' + jobId)
				.end(function(err, res) {
					expect(res.status).to.equal(200);
					expect(res.body.job).to.have.property('name');
					done();
				});
		})
	});
});