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
var ORM = require(serverPath + 'includes/ORM.js');

describe('Image', function () {
	var orm;
	var models;
	var afterCreate;

	before(function (done) {
		orm = new ORM();
		orm.init()
		.then(function (waterline) {
			models = waterline.collections;
			afterCreate = models.image._callbacks.afterCreate;
			done();
		});
	});

	after(function () {
		return orm.destroy();
	});

	afterEach(function () {
		return Promise.map(Object.keys(models), function (model) {
			return models[model].destroy({});
		});
	});

	describe('getExiv2Info', function () {
		it('should parse exiv2 data', function () {
			var fakeResult = [
				'Exif.Image.ImageWidth                        Short       1  12000',
				'Exif.Photo.PixelXDimension                   Long        1  10000',
				'Exif.Thumbnail.JPEGInterchangeFormatLength   Long        1  4532',
				'Xmp.xmp.MetadataDate                         XmpText    25  2013-09-11T22:33:54-04:00',
				'Xmp.dc.format                                XmpText    10  image/jpeg'
			].join('\n');

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

			delete models.image._callbacks.afterCreate;
			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, fakeResult, '');

			return models.image.create({
				path: 'path',
				fileName: 'fileName'
			})
			.then(function (img) {
				return img.getExiv2Info();
			})
			.then(function (exiv2Data) {
				exiv2Data.should.deep.equal(expectedResult);
			})
			.finally(function () {
				execStub.restore();
			});
		});
	});

	describe('getGMInfo', function () {
		it('should return a promise', function (done) {
			delete models.image._callbacks.afterCreate;

			models.image.create({
				path: 'path',
				fileName: 'fileName'
			})
			.then(function (img) {
				return img.getGMInfo();
			})
			.then(function () {
				done();
			})
			.catch(function () {
				done();
			});
		});
	});

	describe('afterCreate', function () {
		it('should call getExiv2Info and getGMInfo after creation', function () {
			models.image._callbacks.afterCreate = afterCreate;

			return models.image.create({
				path: 'test/testfiles',
				fileName: 'valid.jpg',
				permalink: 'permalink'
			})
			.then(function (img) {
				return models.image.findOne({
					permalink: 'permalink'
				});
			}).should.eventually.have.property('metaComplete');
		});
	});

	describe('queueAnalysis', function () {
		var imagePromise;

		before(function () {
			Promise.onPossiblyUnhandledRejection(function () {});

			imagePromise = models.image.create({
				path: 'path',
				fileName: 'fileName',
				permalink: 'permalink'
			});

			return imagePromise;
		});

		it('should return an error if options are null', function () {
			return imagePromise
			.then(function (img) {
				return img.queueAnalysis();
			}).should.be.rejected;
		});

		it('should return an error if there are no valid options', function () {
			var opts = {
				faf: 'wrong',
				lol: 'nope'
			};

			return imagePromise
			.then(function (img) {
				return img.queueAnalysis();
			}).should.be.rejected;
		});

		it('should merge default values', function () {
			var opts = {
				ela: true,
				copymove: {retain: 7},
				hsv: false,
				labfast: {whitebg: true}
			};

			return imagePromise
			.then(function (img) {
				return img.queueAnalysis(opts);
			})
			.then(function (job) {
				var params = job.data.params;
				params.ela.quality.should.equal(70);
				params.copymove.retain.should.equal(7);
				params.should.not.have.property('hsv');
				params.labfast.whitebg.should.be.true;
			});
		});
	});
});