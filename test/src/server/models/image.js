var fs = require('fs');
var child_process = require('child_process');
var async = require('async');

var expect = require('chai').expect;

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var sinon = require('sinon');

var serverPath = '../../../../server/';
var Image = require(serverPath + 'models/image.js');

describe('Image', function () {
	var testImage, wrongType, tooLarge;

	beforeEach(function () {
		testImage = new Image();
		testImage.tmpPath = 'test/testfiles/valid.jpg';
		testImage.path = 'test/testfiles';
		testImage.fileName = 'valid.jpg';

		wrongType = new Image();
		wrongType.tmpPath = 'test/testfiles/wrongtype.txt';

		tooLarge = new Image();
		tooLarge.tmpPath = 'test/testfiles/toolarge.jpg';
	});

	afterEach(function () {
		mockgoose.reset();
	});

	describe('prototype.checkType', function () {
		it('should call `file` with correct arguments', function (done) {
			var execSpy = sinon.spy(child_process, 'exec');
			testImage.checkType(function (err, mime) {
				execSpy.restore();

				expect(mime).to.equal('jpg');
				var call = execSpy.calledWith('file --mime-type ' + testImage.tmpPath);
				expect(call).to.be.true;
				done();
			});
		});

		it('should return error if file type is not accepted', function (done) {
			wrongType.checkType(function (err, mime) {
				expect(err).to.exist;
				done();
			});
		});
	});

	describe('prototype.checkDims', function () {
		it('should return image dimensions', function (done) {
			testImage.checkDims(function (err, dimensions) {
				expect(dimensions.width).to.equal(1);
				expect(dimensions.height).to.equal(1);
				done();
			});
		});

		it('should return error if file dims are too big', function (done) {
			tooLarge.checkDims(function (err, dimensions) {
				expect(err).to.exist;
				done();
			});
		});
	});

	describe('prototype.checkMD5', function () {
		it('should return md5 if image doesnt exist in db', function (done) {
			testImage.checkMD5(function (err, md5) {
				expect(md5).to.equal('46b1c2600c096f27a8bdffdb03dd0222');
				done();
			});
		});

		it('should return image data if image is already in db', function (done) {
			Image.create(
				{
					md5: '46b1c2600c096f27a8bdffdb03dd0222'
				},
				function (err, image) {
					testImage.checkMD5(function (err, md5) {
						expect(md5).to.be.an('object');

						image.remove();
						done();
					});
				}
			);
		});
	});

	describe('prototype.fileChecks', function () {
		it('should delete the file if any checks fail', function (done) {
			var checkTypeStub = sinon.stub(Image.prototype, 'checkType').callsArgWith(0, new Error('stub error'));
			var unlinkStub = sinon.stub(fs, 'unlink');

			testImage.fileChecks(function (err, image) {
				checkTypeStub.restore();
				unlinkStub.restore();

				expect(err).to.not.be.null;
				expect(unlinkStub.calledWith(testImage.tmpPath)).to.be.true;
				done();
			});
		});

		it('should delete the file and return image data if duplicate', function (done) {
			var unlinkStub = sinon.stub(fs, 'unlink');

			Image.create(
				{
					md5: '46b1c2600c096f27a8bdffdb03dd0222'
				},
				function (err, image) {
					testImage.fileChecks(function (err, img) {
						unlinkStub.restore();
						image.remove();

						expect(err).to.be.null;
						expect(img).to.have.property('duplicate');
						expect(unlinkStub.calledWith(testImage.tmpPath)).to.be.true;
						done();
					});
			});
		});

		it('should save the file if checks are ok', function (done) {
			var renameStub = sinon.stub(fs, 'renameSync');
			var mkdirStub = sinon.stub(fs, 'mkdirSync');
			var unlinkStub = sinon.stub(fs, 'unlink');

			testImage.fileChecks(function (err, image) {
				renameStub.restore();
				mkdirStub.restore();
				unlinkStub.restore();

				expect(image.fileName).to.be.equal('46b1c2600c096f27a8bdffdb03dd0222.jpg');
				expect(image).to.not.have.property('duplicate');

				image.remove();
				done();
			});
		});
	});

	describe('prototype.getExiv2Info', function () {
		it('should return empty object if error', function (done) {
			var fakeError = new Error('stub error');
			fakeError.code = -1;

			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, fakeError);

			testImage.getExiv2Info(function (err, exiv2data) {
				execStub.restore();

				expect(err).to.be.null;
				expect(exiv2data).to.be.empty;
				done();
			});
		});

		it('should parse exiv2 data', function (done) {
			var fakeResult = [
				'Exif.Image.ImageWidth                        Short       1  12000',
				'Exif.Photo.PixelXDimension                   Long        1  10000',
				'Exif.Thumbnail.JPEGInterchangeFormatLength   Long        1  4532',
				'Xmp.xmp.MetadataDate                         XmpText    25  2013-09-11T22:33:54-04:00',
				'Xmp.dc.format                                XmpText    10  image/jpeg'
			].join('\n');

			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, fakeResult, '');

			var expectedResult = {
				Exif: {
					Image: {
						ImageWidth: '12000'
					},
					Photo: {
						PixelXDimension: '10000'
					},
					Thumbnail: {
						JPEGInterchangeFormatLength: '4532'
					}
				},
				Xmp: {
					xmp: {
						MetadataDate: '2013-09-11T22:33:54-04:00'
					},
					dc: {
						format: 'image/jpeg'
					}
				}
			};

			testImage.getExiv2Info(function (err, exiv2data) {
				execStub.restore();

				expect(exiv2data).to.be.eql(expectedResult);
				done();
			});
		});
	});

	describe('prototype.getGMInfo', function () {
		it('should not throw an error if gm returns error', function (done) {
			var gmStub = Image.__set__({
				gm: function(filename) {
				return {
					identify: function(cb) {
						cb(new Error('stub error'));
					}
				}
			}});

			testImage.getGMInfo(function (err, gmInfo) {
				gmStub();

				expect(err).to.be.null;
				expect(gmInfo).to.be.empty;
				done();
			});
		});
	});

	describe('prototype.getMetadata', function () {
		it('should set metaComplete flag and save', function (done) {
			testImage.getMetadata(function (err, image) {
				expect(image).to.have.property('metaComplete');
				done();
			});
		});
	});

	describe('prototype.queueAnalysis', function () {
		it('should return an error if options are null', function (done) {
			testImage.queueAnalysis(null, function (err, job) {
				expect(err).to.not.be.null;
				done();
			});
		});

		it('should return an error if there are no valid options', function (done) {
			var opts = {
				faf: 'wrong',
				lol: 'nope'
			};

			testImage.queueAnalysis(opts, function (err, job) {
				expect(err).to.not.be.null;
				done();
			});
		});

		it('should merge default values', function (done) {
			var opts = {
				ela: true,
				copymove: {retain: 7},
				hsv: false,
				labfast: {whitebg: true}
			};

			testImage.queueAnalysis(opts, function (err, job) {
				expect(err).to.be.null;

				var params = job.data.params;
				expect(params.ela.quality).to.equal(70);
				expect(params.copymove.retain).to.equal(7);
				expect(params).to.not.have.property('hsv');
				expect(params.labfast.whitebg).to.be.true;

				done();
			});
		});
	});

	describe('prototype.processSubmission', function () {
		it('should return an error if any file checks fail', function (done) {
			var fakeError = new Error('stub error');

			var fileChecksStub = sinon.stub(Image.prototype, 'fileChecks').callsArgWith(0, fakeError);
			var unlinkStub = sinon.stub(fs, 'unlink');

			testImage.processSubmission(function (err, image) {
				fileChecksStub.restore();
				unlinkStub.restore();

				expect(err).to.exist;
				expect(image).to.not.exist;
				done();
			});
		});

		it('should get metadata and queue default analysis if image isnt duplicate', function (done) {
			var getMetadataStub = sinon.stub(Image.prototype, 'getMetadata');
			var queueAnalysisStub = sinon.stub(Image.prototype, 'queueAnalysis').callsArgWith(1, null, {data:{_id: 5}});
			var fileChecksStub = sinon.stub(Image.prototype, 'fileChecks').callsArgWith(0, null, testImage);

			testImage.processSubmission(function (err, image) {
				getMetadataStub.restore();
				queueAnalysisStub.restore();
				fileChecksStub.restore();

				expect(getMetadataStub.called).to.be.true;
				expect(queueAnalysisStub.called).to.be.true;
				done();
			});
		});

		it('should return the image if its a duplicate', function (done) {
			var getMetadataStub = sinon.stub(Image.prototype, 'getMetadata');
			var queueAnalysisStub = sinon.stub(Image.prototype, 'queueAnalysis').callsArgWith(1, null, {data:{_id: 5}});
			var fileChecksStub = sinon.stub(Image.prototype, 'fileChecks').callsArgWith(0, null, testImage);

			testImage.duplicate = true;

			testImage.processSubmission(function (err, image) {
				getMetadataStub.restore();
				queueAnalysisStub.restore();
				fileChecksStub.restore();

				expect(getMetadataStub.called).to.be.false;
				expect(queueAnalysisStub.called).to.be.false;
				done();
			});
		});
	});
});