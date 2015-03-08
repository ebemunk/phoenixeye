var fs = require('fs');

var expect = require('chai').expect;
var request = require('supertest');

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var sinon = require('sinon');
var rewire = require('rewire');

var serverPath = '../../../../server/';
var Image = rewire(serverPath + 'models/image.js');

var server = require(serverPath + 'server.js').server;

var testServer = request(server);

before(function () {
	//mocking monq.queue.enqueue
	Image.__set__('queue', {
		enqueue: function(a,b,c) {
			return c(null, {data:{params:b, _id:5}});
		}
	});
});

describe('/api/images', function () {
	describe('/upload', function () {
		after(function () {
			var rmDirContents = function(dirPath) {
				try { var files = fs.readdirSync(dirPath); }
				catch(e) { return; }
				if (files.length > 0) {
					for (var i = 0; i < files.length; i++) {
						var filePath = dirPath + '/' + files[i];
						if(filePath == 'tmp/.gitignore') continue;
						if (fs.statSync(filePath).isFile())
							fs.unlinkSync(filePath);
						else
							rmDir(filePath);
					}
				}
			};
			rmDirContents('tmp');
		});

		it('should not accept multiple files', function (done) {
			testServer
				.post('/api/images/upload')
				.attach('image1', 'test/testfiles/empty.jpg')
				.attach('image2', 'test/testfiles/valid.jpg')
				.expect(400, done);
		});

		it('should not accept empty files', function (done) {
			var statStub = sinon.stub(fs, 'statSync').returns({size: 0});
			testServer
				.post('/api/images/upload')
				.attach('image', 'test/testfiles/empty.jpg')
				.end(function (err, res) {
					expect(res.status).to.equal(400);

					statStub.restore();
					done();
				});
		});

		it('should not accept wrong type', function (done) {
			testServer
				.post('/api/images/upload')
				.attach('image', 'test/testfiles/wrongtype.txt')
				.expect(400, done);
		});

		it('should not accept very large images (dims)', function (done) {
			testServer
				.post('/api/images/upload')
				.attach('image', 'test/testfiles/toolarge.jpg')
				.expect(400, done);
		});

		it('should accept valid file', function (done) {
			var existsStub = sinon.stub(fs, 'existsSync').returns(true);
			var renameStub = sinon.stub(fs, 'renameSync').returns(true);
			var statStub = sinon.stub(fs, 'statSync').returns({size: 1});
			testServer
				.post('/api/images/upload')
				.attach('image', 'test/testfiles/valid.jpg')
				.end(function (err, res) {
					expect(res.status).to.equal(200);
					expect(res.body.image).to.have.property('fileName', '46b1c2600c096f27a8bdffdb03dd0222.jpg')
					expect(res.body.image).not.to.have.property('duplicate');
					expect(res.body).to.have.property('jobId');

					Image.findOne({md5: '46b1c2600c096f27a8bdffdb03dd0222'}, function (err, image) {
						expect(image).to.not.be.undefined;

						existsStub.restore();
						renameStub.restore();
						statStub.restore();
						done();
					});
				});
		});

		it('should return image info if duplicate', function (done) {
			testServer
				.post('/api/images/upload')
				.attach('image', 'test/testfiles/valid.jpg')
				.end(function (err, res) {
					expect(res.status).to.equal(200);
					expect(res.body.image).to.have.property('duplicate', true);
					done();
				});
		});
	});

	describe('/analysis/:permalink', function () {
		before(function (done) {
			Image.create({
				permalink: 'testPermalink',
				id: 'testId'
			}, function (err, image) {
				done();
			});
		});

		it('should return error if permalink doesnt exist', function (done) {
			testServer
				.post('/api/images/analysis/wrong')
				.expect(400, done);
		});

		it('should return error if no valid params found', function (done) {
			testServer
				.post('/api/images/analysis/testPermalink')
				.send({wrong: 'nope', lolo: 'kekek'})
				.expect(400, done);			
		});

		it('should enqueue job if valid params', function (done) {
			testServer
				.post('/api/images/analysis/testPermalink')
				.send({ela: true, hsv: {whitebg: true}})
				.end(function (err, res) {
					expect(res.status).to.equal(200);
					expect(res.body).to.have.property('jobId');

					done();
				});
		});
	});

	describe('/:permalink', function () {
		it('should return error if permalink doesnt exist', function (done) {
			testServer
				.get('/api/images/wrong')
				.expect(404, done);
		});

		it('should return image data if permalink exists', function (done) {
			testServer
				.get('/api/images/testPermalink')
				.end(function(err, res) {
					expect(res.status).to.equal(200);
					expect(res.body.image).to.have.property('_id');
					done();
				});
		})
	});
});