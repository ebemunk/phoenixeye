process.env.NODE_ENV = 'test';

var chai = require('chai');
chai.should();

var Promise = require('bluebird');

var serverPath = '../../../../server/';
var config = require(serverPath + 'config.json');
var PhoenixWorker = require(serverPath + 'workers/PhoenixWorker.js');

describe('phoenix', function () {
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
});