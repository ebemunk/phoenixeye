var child_process = require('child_process');

var expect = require('chai').expect;

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var sinon = require('sinon');

var serverPath = '../../../../server/';
var Image = require(serverPath + 'models/image.js');
var phoenixWorker = require(serverPath + 'workers/phoenix.js');
var config = require(serverPath + 'config.json');

describe('phoenix-worker', function () {
	describe('getJobString', function () {
		it('should construct cmd with correct params', function () {
			var cmd = phoenixWorker.getJobString(config.defaultAnalysisOpts, 'mypath', 'myname');

			expect(cmd).to.contain('-f mypath');
			expect(cmd).to.contain('-o mypath');
			expect(cmd).to.contain('-json');
			expect(cmd).to.contain('-ela ' + config.defaultAnalysisOpts.ela.quality);
			expect(cmd).to.contain('-avgdist');
			expect(cmd).to.contain('-lg');
			expect(cmd).to.contain('-hsv');
			expect(cmd).to.contain('-labfast');
			expect(cmd).to.contain('-copymove ' + config.defaultAnalysisOpts.copymove.retain + ' ' + config.defaultAnalysisOpts.copymove.qcoeff);
			expect(cmd).to.not.contain('-autolevels');
		});
	});

	describe('workerFunc', function () {
		it('should return an error if image isnt found', function (done) {
			phoenixWorker.workerFunc({imageId: mongoose.Types.ObjectId()}, function (err, result) {
				expect(err).to.exist;
				done();
			});
		});

		it('should return the error if theres a problem with phoenix cmd', function (done) {
			var fakeError = new Error('stub error');
			fakeError.code = -1;

			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, fakeError);

			Image.create(
				{
					path: 'mypath',
					fileName: 'myfile'
				},
				function (err, image) {
					phoenixWorker.workerFunc(
						{
							imageId: image._id,
						},
						function (err, result) {
							expect(err).to.exist;

							execStub.restore();
							image.remove();
							done();
						}
					);
				}
			);
		});

		it('should return an error if result from phoenix is corrupted', function (done) {
			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, '!@#$');

			Image.create(
				{
					path: 'mypath',
					fileName: 'myfile'
				},
				function (err, image) {
					phoenixWorker.workerFunc(
						{
							imageId: image._id,
						},
						function (err, result) {
							expect(err).to.exist;

							image.remove();
							execStub.restore();
							done();
						}
					);
				}
			);
		});

		it('should save each analysis separately on success', function (done) {
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

			var execStub = sinon.stub(child_process, 'exec').callsArgWith(1, null, fakeOutput);

			Image.create(
				{
					path: 'mypath',
					fileName: 'myfile'
				},
				function (err, image) {
					phoenixWorker.workerFunc(
						{
							imageId: image._id,
						},
						function (err, result) {
							expect(err).to.not.exist;

							image.remove();
							execStub.restore();
							done();
						}
					);
				}
			);
		});
	});
});