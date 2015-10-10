process.env.NODE_ENV = 'test';

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
var SubmittedFile = rewire(serverPath + 'models/SubmittedFile.js');
var ORM = require(serverPath + 'includes/ORM.js');

describe('SubmittedFile', function () {
	var testImage, wrongType, tooLarge;
	var orm;
	var models;
	var unlinkStub;

	before(function (done) {
		unlinkStub = sinon.stub(fs, 'unlink').returns(true);

		orm = new ORM();
		orm.init()
		.then(function (waterline) {
			models = waterline.collections;
			delete models.image._callbacks.afterCreate;
			done();
		});
	});

	after(function () {
		unlinkStub.restore();
		return orm.destroy();
	});

	beforeEach(function () {
		testImage = new SubmittedFile();
		testImage.tmpPath = 'test/testfiles/valid.jpg';
		testImage.path = 'test/testfiles';
		testImage.fileName = 'valid.jpg';

		wrongType = new SubmittedFile();
		wrongType.tmpPath = 'test/testfiles/wrongtype.txt';

		tooLarge = new SubmittedFile();
		tooLarge.tmpPath = 'test/testfiles/toolarge.jpg';
	});

	afterEach(function () {
		return Promise.map(Object.keys(models), function (model) {
			return models[model].destroy({});
		});
	});

	describe('prototype.checkType', function () {
		it('should call `file` with correct arguments', function (done) {
			var execStub = sinon.stub().resolves(['a: image/jpeg', '']);
			var restore = SubmittedFile.__set__('exec', execStub);

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
			var restore = SubmittedFile.__set__('exec', execStub);

			return wrongType.checkType()
			.should.be.rejected
			.notify(restore);
		});
	});

	describe('prototype.checkDims', function () {
		it('should return image dimensions', function () {
			var sizeStub = sinon.stub().resolves({height: 1, width: 1, derpy: 1});
			var restore = SubmittedFile.__set__('imageSize', sizeStub);

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
			var restore = SubmittedFile.__set__('imageSize', sizeStub);

			return tooLarge.checkDims()
			.should.be.rejected
			.notify(restore);
		});
	});

	describe('prototype.checkMD5', function () {
		it('should return md5 if image doesnt exist in db', function () {
			return testImage.checkMD5(models.image)
			.should.eventually.equal('4aba1a2b880a3760b368c9bbd5acccf1');
		});

		it('should return image data if image is already in db', function () {
			return models.image.create({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1'
			})
			.then(function (image) {
				return testImage.checkMD5(models.image);
			})
			.should.eventually.have.property('duplicate');
		});
	});

	describe('prototype.fileChecks', function () {
		it('should delete the file if any checks fail', function () {
			var mvStub = sinon.stub().callsArgWith(3, null, true);
			var restore = SubmittedFile.__set__('mv', mvStub);

			return wrongType.fileChecks(models.image)
			.catch(function (err) {
				if( unlinkStub.called ) {
					throw err;
				}
			}).should.be.rejected
			.notify(function () {
				restore();
			});
		});

		it('should delete the file and return image data if duplicate', function () {
			return models.image.create({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1'
			})
			.then(function (image) {
				return testImage.fileChecks(models.image)
			})
			.then(function (image) {
				image.should.have.property('duplicate');
				unlinkStub.called.should.be.true;
			});
		});

		it('should save the file if checks are ok', function () {
			var mvStub = sinon.stub().callsArgWith(3, null, true);
			var restore = SubmittedFile.__set__('mv', mvStub);

			return testImage.fileChecks(models.image)
			.then(function (image) {
				restore();

				image.should.not.have.property('duplicate');
			});
		});
	});
});