/*eslint-env node, mocha*/
/*global inject*/

'use strict';

describe('Service: ImageService', function () {
	var ImageService;
	var $httpBackend;

	beforeEach(module('phoenixeye'));

	beforeEach(module(function ($urlRouterProvider) {
		$urlRouterProvider.deferIntercept();
	}));

	beforeEach(inject(function ($injector) {
		ImageService = $injector.get('ImageService');
		$httpBackend = $injector.get('$httpBackend');
	}));

	describe('prototype.getAnalyses', function () {
		it('should return a promise', function () {
			$httpBackend.expectGET('api/analyses/permalink')
			.respond(200, {});

			var result = ImageService.getAnalyses('permalink');

			result.should.have.property('then');

			$httpBackend.flush();
		});

		it('should return a promise with result [analyses, histograms]', function (done) {
			$httpBackend.expectGET('api/analyses/permalink')
			.respond(200, 
				[
					{
						type: 'ela'
					},
					{
						type: 'lg'
					},
					{
						type: 'lab_fast'
					},
					{
						type: 'hsv'
					},
					{
						type: 'copymove'
					},
					{
						type: 'avgdist'
					}
				]
			);

			ImageService.getAnalyses('permalink')
			.spread(function (analyses, histograms) {
				Object.keys(analyses).length.should.equal(4);
				Object.keys(histograms).length.should.equal(2);

				done();
			})
			.catch(function (err) {
				done(err);
			});

			$httpBackend.flush();
		});

		it('should sort analyses by createdAt descending', function (done) {
			/*eslint no-unused-vars: 0*/

			$httpBackend.expectGET('api/analyses/permalink')
			.respond(200, 
				[
					{
						type: 'ela',
						createdAt: '2015-09-09T04:51:08.651Z'
					},
					{
						type: 'ela',
						createdAt: '2015-09-12T04:51:08.651Z',
						atTop: true
					}
				]
			);

			ImageService.getAnalyses('permalink')
			.spread(function (analyses, histograms) {
				analyses.ela[0].atTop.should.be.true;

				done();
			})
			.catch(function (err) {
				done(err);
			});

			$httpBackend.flush();
		});
	});
});