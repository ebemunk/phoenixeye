var child_process = require('child_process');
var fs = require('fs');

var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

var Promise = require('bluebird');

var rewire = require('rewire');
var sinon = require('sinon');
require('sinon-as-promised')(Promise);

var serverPath = '../../../../server/';
var submittedFile = rewire(serverPath + 'models/submittedFile.js');

describe('submittedFile', function () {
	var testImage, wrongType, tooLarge;
	var models;

	before(function (done) {
		require(serverPath + 'server.js')
		.then(function (app) {
			models = app.models;
			delete models.image._callbacks.afterCreate;
			done();
		});
	});

	beforeEach(function () {
		testImage = new submittedFile();
		testImage.tmpPath = 'test/testfiles/valid.jpg';
		testImage.path = 'test/testfiles';
		testImage.fileName = 'valid.jpg';

		wrongType = new submittedFile();
		wrongType.tmpPath = 'test/testfiles/wrongtype.txt';

		tooLarge = new submittedFile();
		tooLarge.tmpPath = 'test/testfiles/toolarge.jpg';
	});

	afterEach(function () {
		Promise.map(Object.keys(models), function (model) {
			return models[model].destroy({});
		});
	});

	describe('prototype.checkType', function () {
		it('should call `file` with correct arguments', function (done) {
			var execStub = sinon.stub().resolves(['a: image/jpeg', '']);
			var restore = submittedFile.__set__('exec', execStub);

			testImage.checkType()
			.then(function (mime) {
				restore();

				mime.should.equal('jpg');

				var call = execStub.calledWith('file --mime-type ' + testImage.tmpPath);
				call.should.be.true;

				done();
			});
		});

		it('should return error if file type is not accepted', function () {
			var execStub = sinon.stub().resolves(['a: wrong/mime', '']);
			var restore = submittedFile.__set__('exec', execStub);

			return wrongType.checkType()
			.should.be.rejected
			.notify(restore);
		});
	});

	describe('prototype.checkDims', function () {
		it('should return image dimensions', function () {
			var sizeStub = sinon.stub().resolves({height: 1, width: 1, derpy: 1});
			var restore = submittedFile.__set__('imageSize', sizeStub);

			return testImage.checkDims()
			.then(function (dims) {
				restore();

				dims.should.have.property('height');
				dims.should.have.property('width');
				dims.should.not.have.property('derpy');

				var call = sizeStub.calledWith(testImage.tmpPath);
				call.should.be.true;
			});
		});

		it('should return error if file dims are too big', function () {
			var sizeStub = sinon.stub().resolves({height: 10000, width: 100000});
			var restore = submittedFile.__set__('imageSize', sizeStub);

			return tooLarge.checkDims()
			.should.be.rejected
			.notify(restore);
		});
	});

	describe('prototype.checkMD5', function () {
		it('should return md5 if image doesnt exist in db', function () {
			return testImage.checkMD5(models.image)
			.should.eventually.equal('46b1c2600c096f27a8bdffdb03dd0222');
		});

		it('should return image data if image is already in db', function () {
			return models.image.create({
				md5: '46b1c2600c096f27a8bdffdb03dd0222'
			})
			.then(function (image) {
				return testImage.checkMD5(models.image);
			})
			.should.eventually.have.property('duplicate');
		});
	});

	describe('prototype.fileChecks', function () {
		it('should delete the file if any checks fail', function () {
			var mkdirStub = sinon.stub(fs, 'mkdirAsync').resolves(true);
			var renameStub = sinon.stub(fs, 'renameAsync').resolves(true);
			var unlinkStub = sinon.stub(wrongType, 'unlink');

			return wrongType.fileChecks(models.image)
			.catch(function (err) {
				if( unlinkStub.called ) {
					throw err;
				}
			}).should.be.rejected
			.notify(function () {
				mkdirStub.restore();
				renameStub.restore();
				unlinkStub.restore();
			});
		});

		it('should delete the file and return image data if duplicate', function () {
			var unlinkStub = sinon.stub(testImage, 'unlink');

			return models.image.create({
				md5: '46b1c2600c096f27a8bdffdb03dd0222'
			})
			.then(function (image) {
				return testImage.fileChecks(models.image)
			})
			.then(function (image) {
				unlinkStub.restore();

				image.should.have.property('duplicate');
				unlinkStub.called.should.be.true;
			});
		});

		it('should save the file if checks are ok', function () {
			var mkdirStub = sinon.stub(fs, 'mkdirAsync').resolves(true);
			var renameStub = sinon.stub(fs, 'renameAsync').resolves(true);

			return testImage.fileChecks(models.image)
			.then(function (image) {
				mkdirStub.restore();
				renameStub.restore();

				image.should.not.have.property('duplicate');
			});
		});
	});
});