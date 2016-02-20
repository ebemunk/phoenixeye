process.env.NODE_ENV = 'test';

var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();

var sinon = require('sinon');

var Promise = require('bluebird');
var child_process = require('child_process');
var fs = require('fs');

var serverPath = '../../../../server/';
var config = require(serverPath + 'config.json');
var PhoenixWorker = require(serverPath + 'workers/PhoenixWorker.js');

describe('PhoenixWorker', function () {
	var worker;

	before(function (done) {
		new PhoenixWorker()
		.then(function (phoenix) {
			worker = phoenix;
			done();
		});
	});

	after(function () {
		return worker.destroy();
	});

	afterEach(function () {
		return Promise.map(Object.keys(worker.models), function (model) {
			return worker.models[model].destroy({});
		});
	});

	describe('getJobString', function () {
		it('should construct cmd with correct params', function () {
			var cmd = worker.getJobString(config.defaultAnalysisOpts, 'mypath', 'myname');

			cmd.should.contain('-f mypath/myname');
			cmd.should.contain('-o mypath');
			cmd.should.contain('-json');
			cmd.should.contain('-ela ' + config.defaultAnalysisOpts.ela.quality);
			cmd.should.contain('-avgdist');
			cmd.should.contain('-lg');
			cmd.should.contain('-hsv');
			cmd.should.contain('-labfast');
			cmd.should.contain('-copymove ' + config.defaultAnalysisOpts.copymove.retain + ' ' + config.defaultAnalysisOpts.copymove.qcoeff);
			cmd.should.not.contain('-autolevels');
		});
	});

	describe('handleJob', function () {
		it('should return an error if image isnt found', function () {
			return worker.handleJob({
				imageId: 'wrong'
			}).should.eventually.be.rejected;
		});

		it('should return the error if theres a problem with phoenix cmd', function () {
			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, new Error('stub error'));

			return worker.models.image.create({
				path: 'mypath',
				fileName: 'myfile',
				permalink: 'permalink'
			})
			.then(function (image) {
				return worker.handleJob({
					imageId: image.id
				});
			}).finally(function () {
				execStub.restore();
			}).should.be.rejected;
		});

		it('should return an error if result from phoenix is corrupted', function () {
			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, ['!@#$']);

			return worker.models.image.create({
				path: 'mypath',
				fileName: 'myfile',
				permalink: 'permalink'
			})
			.then(function (image) {
				return worker.handleJob({
					imageId: image.id
				});
			})
			.finally(function () {
				execStub.restore();
			}).should.be.rejected;
		});

		it('should save each analysis separately on success', function () {
			var fakeOutput = JSON.stringify({
				ela: {
					quality: '70',
					filename: 'a_ela.png'
				},
				lg: {
					filename: 'a_lg.png'
				},
				avgdist: {
					filename: 'a_avgdist.png'
				},
				hsv: {
					whitebg: 'false',
					filename: 'a_hsv.png'
				},
				lab_fast: {
					whitebg: 'false',
					filename: 'a_lab_fast.png'
				},
				copymove: {
					retain: '4',
					qcoeff: '1',
					filename: 'a_copymove.png'
				},
				imagick_estimate: '80',
				hf_estimate: '80.34613756613756',
				qtables: {
					'0': '6,4,4,6,10,16,20,24,5,5,6,8,10,23,24,22,6,5,6,10,16,23,28,22,6,7,9,12,20,35,32,25,7,9,15,22,27,44,41,31,10,14,22,26,32,42,45,37,20,26,31,35,41,48,48,40,29,37,38,39,45,40,41,40',
					'1': '7,7,10,19,40,40,40,40,7,8,10,26,40,40,40,40,10,10,22,40,40,40,40,40,19,26,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40,40'
				}
			});

			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, [fakeOutput]);
			var renameStub = sinon.stub(fs, 'renameSync').returns(true);

			var image;

			return worker.models.image.create({
					path: 'mypath',
					fileName: 'myfile',
					permalink: 'permalink'
			})
			.then(function (img) {
				image = img;

				return worker.handleJob({
					imageId: image.id,
				});
			})
			.then(function (result) {
				return worker.models.analysis.find({
					imageId: image.id
				});
			})
			.then(function (analyses) {
				analyses.length.should.equal(6);

				return analyses;
			})
			.finally(function () {
				execStub.restore();
				renameStub.restore();
			}).should.be.fulfilled;
		});

		it('should remove the oldest analysis if theres more than 3 of same type', function () {
			var fakeOutput = JSON.stringify({
				ela: {
					quality: 28,
					filename: 'a_ela.png'
				}
			});

			var randImageId = 123;

			var fakeAnalyses = [
				{
					imageId: randImageId,
					type: 'ela',
					params: {quality: 25},
					created: new Date(0),
					path: 'mypath',
					fileName: 'filename'
				},
				{
					imageId: randImageId,
					type: 'ela',
					params: {quality: 26},
					created: new Date(50)
				},
				{
					imageId: randImageId,
					type: 'ela',
					params: {quality: 27},
					created: new Date(100)
				}
			];

			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, [fakeOutput]);
			var renameStub = sinon.stub(fs, 'renameSync').returns(true);
			var unlinkStub = sinon.stub(fs, 'unlink').returns(true);

			return worker.models.analysis.create(fakeAnalyses)
			.then(function (analyses) {
				return worker.models.image.create({
					path: 'mypath',
					fileName: 'myfile',
					permalink: 'permalink',
					id: randImageId
				});
			})
			.then(function (image) {
				return worker.handleJob({
					imageId: randImageId,
					ela: {quality: 28}
				});
			})
			.then(function (analyses) {
				return worker.models.analysis.find({
					imageId: randImageId,
					type: 'ela',
					'params.quality': 25
				});
			})
			.then(function (analysis) {
				analysis.should.be.empty;

				execStub.restore();
				renameStub.restore();
				unlinkStub.restore();
			})
			.catch(function (err) {
				console.log('aegae', err);
			});
		});
	});
});