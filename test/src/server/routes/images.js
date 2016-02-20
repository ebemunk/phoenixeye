process.env.NODE_ENV = 'test';

var chai = require('chai');
chai.should();

var sinon = require('sinon');
var supertest = require('supertest');

var fs = require('fs');
var request = require('request');

var Promise = require('bluebird');

var serverPath = '../../../../server/';

describe('/api/images', function () {
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

	describe('/upload', function () {
		it('should not accept multiple files', function (done) {
			testServer
			.post('/api/images/upload')
			.attach('image1', 'test/testfiles/empty.jpg')
			.attach('image2', 'test/testfiles/valid.jpg')
			.end(function (err, res) {
				res.status.should.equal(400);
				done();
			});
		});

		it('should not accept empty files', function (done) {
			testServer
			.post('/api/images/upload')
			.attach('image', 'test/testfiles/empty.jpg')
			.end(function (err, res) {
				res.status.should.equal(415);

				done();
			});
		});

		it('should not accept wrong type', function (done) {
			testServer
			.post('/api/images/upload')
			.attach('image', 'test/testfiles/wrongtype.txt')
			.expect(415, done);
		});

		it('should not accept very large images (dims)', function (done) {
			testServer
			.post('/api/images/upload')
			.attach('image', 'test/testfiles/toolarge.jpg')
			.expect(413, done);
		});

		it('should accept valid file', function (done) {
			var mkdirStub = sinon.stub(fs, 'mkdirAsync').resolves(true);
			var renameStub = sinon.stub(fs, 'renameAsync').resolves(true);

			testServer
			.post('/api/images/upload')
			.attach('image', 'test/testfiles/valid.jpg')
			.end(function (err, res) {
				renameStub.restore();
				mkdirStub.restore();

				res.status.should.equal(200);
				res.body.image.should.have.property('md5', '4aba1a2b880a3760b368c9bbd5acccf1')
				res.body.image.should.not.have.property('duplicate');
				res.body.should.have.property('jobId');

				models.image.findOne({
					md5: '4aba1a2b880a3760b368c9bbd5acccf1'
				})
				.then(function (image) {
					image.should.exist;
					done();
				});
			});
		});

		it('should return image info if duplicate', function (done) {
			models.image.create({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1',
				path: 'test/testfiles',
				fileName: 'valid.jpg',
				permalink: 'permalink'
			})
			.then(function (image) {
				testServer
				.post('/api/images/upload')
				.attach('image', 'test/testfiles/valid.jpg')
				.end(function (err, res) {
					res.status.should.equal(200);
					res.body.image.should.have.property('duplicate');
					done();
				});
			});
		});
	});

	describe('/submit', function () {
		it('should require url', function (done) {
			testServer
			.post('/api/images/submit')
			.send({derp: 'lol'})
			.expect(400, done);
		});

		it('should not accept invalid url', function (done) {
			testServer
			.post('/api/images/submit')
			.send({url: 'wrong'})
			.expect(500, done);
		});

		it('should not accept very large images (dims)', function (done) {
			var requestStub = sinon.stub(request, 'head').callsArgWith(1, null, {headers:{'content-length': 100000000}}, null);

			testServer
			.post('/api/images/submit')
			.send({url: 'toobig'})
			.end(function (err, res) {
				requestStub.restore();

				res.status.should.equal(413);
				done();
			});
		});

		it('should not accept very large images (size)', function (done) {
			var rstream = fs.createReadStream('test/testfiles/toolarge.jpg');
			var requestHeadStub = sinon.stub(request, 'head').callsArgWith(1, null, {headers:{'content-length': 1}}, null);
			var requestGetStub = sinon.stub(request, 'get').returns(rstream);

			testServer
			.post('/api/images/submit')
			.send({url: 'toolarge'})
			.end(function (err, res) {
				requestHeadStub.restore();
				requestGetStub.restore();

				res.status.should.equal(413);
				done();
			});
		});

		it('should not accept wrong type', function (done) {
			var rstream = fs.createReadStream('test/testfiles/wrongtype.txt');
			var requestHeadStub = sinon.stub(request, 'head').callsArgWith(1, null, {headers:{'content-length': 1}}, null);
			var requestGetStub = sinon.stub(request, 'get').returns(rstream);

			testServer
			.post('/api/images/submit')
			.send({url: 'wrongtype'})
			.end(function (err, res) {
				requestHeadStub.restore();
				requestGetStub.restore();

				res.status.should.equal(415);
				done();
			});
		});

		it('should accept valid file', function (done) {
			var rstream = fs.createReadStream('test/testfiles/valid.jpg');
			var requestHeadStub = sinon.stub(request, 'head').callsArgWith(1, null, {headers:{'content-length': 1}}, null);
			var requestGetStub = sinon.stub(request, 'get').returns(rstream);
			var mkdirStub = sinon.stub(fs, 'mkdirAsync').resolves(true);
			var renameStub = sinon.stub(fs, 'renameAsync').resolves(true);

			testServer
			.post('/api/images/submit')
			.send({url: 'valid'})
			.end(function (err, res) {
				requestHeadStub.restore();
				requestGetStub.restore();
				renameStub.restore();
				mkdirStub.restore();

				res.status.should.equal(200);
				res.body.image.should.have.property('fileName')
				done();
			});
		});
	});

	describe('/:permalink', function () {
		beforeEach(function () {
			return models.image.create({
				path: 'path',
				fileName: 'fileName',
				permalink: 'testPermalink'
			});
		});

		it('should return error if permalink doesnt exist', function (done) {
			testServer
			.get('/api/images/wrong')
			.expect(404, done);
		});

		it('should return image data if permalink exists', function (done) {
			testServer
			.get('/api/images/testPermalink')
			.end(function (err, res) {
				res.status.should.equal(200);
				res.body.image.should.have.property('createdAt');
				done();
			});
		})
	});

	describe('/:permalink/analysis', function () {
		beforeEach(function () {
			return models.image.create({
				path: 'path',
				fileName: 'fileName',
				permalink: 'testPermalink'
			});
		});

		it('should return error if permalink doesnt exist', function (done) {
			testServer
			.post('/api/images/wrong/analysis')
			.expect(404, done);
		});

		it('should return error if no valid params found', function (done) {
			testServer
			.post('/api/images/testPermalink/analysis')
			.send({wrong: 'nope', lolo: 'kekek'})
			.expect(500, done);			
		});

		it('should enqueue job if valid params', function (done) {
			testServer
			.post('/api/images/testPermalink/analysis')
			.send({ela: true, hsv: {whitebg: true}})
			.end(function (err, res) {
				res.body.should.have.property('jobId');

				done();
			});
		});
	});
});