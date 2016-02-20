/*eslint-env node, mocha*/
/*global inject*/

'use strict';

describe('Service: PollService', function () {
	var PollService;
	var $httpBackend;
	var $timeout;
	var $rootScope;

	beforeEach(module('phoenixeye'));

	beforeEach(module(function ($urlRouterProvider) {
		$urlRouterProvider.deferIntercept();
	}));

	beforeEach(inject(function ($injector) {
		PollService = $injector.get('PollService');
		$httpBackend = $injector.get('$httpBackend');
		$timeout = $injector.get('$timeout');
		$rootScope = $injector.get('$rootScope');
	}));

	describe('prototype.pollUntil', function () {
		it('should return a promise', function () {
			$httpBackend.expectGET('api/images/permalink')
			.respond(200, {});

			var promise = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function () {
				return false;
			});

			$httpBackend.flush();
			$timeout.flush();

			promise.should.have.property('then');
		});

		it('should call $http with the config given', function () {
			$httpBackend.expectGET('api/images/permalink')
			.respond(200, {});

			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function () {
				return true;
			});

			$httpBackend.flush();
			$timeout.flush();
		});

		it('should reject promise on server error', function () {
			$httpBackend.expectGET('api/images/permalink')
			.respond(400, {});

			var rejected = false;

			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function () {
				return true;
			})
			.catch(function () {
				rejected = true;
			});

			$httpBackend.flush();
			$timeout.flush();

			rejected.should.be.true;
		});

		it('should keep polling until condition fn returns true', function () {
			$httpBackend.expect('GET', 'api/images/permalink')
			.respond(200, {condition: false});

			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function (resp) {
				return resp.condition;
			});

			$timeout.flush();
			$httpBackend.flush();

			$httpBackend.expect('GET', 'api/images/permalink')
			.respond(200, {condition: true});

			$timeout.flush();
			$httpBackend.flush();
		});

		it('should resolve promise once condition fn returns true', function () {
			$httpBackend.expect('GET', 'api/images/permalink')
			.respond(200, {condition: true});

			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function (resp) {
				return resp.condition;
			});

			$timeout.flush();
			$httpBackend.flush();
		});

		it('should not stop poll if new state change is image', function () {
			$httpBackend.when('GET', 'api/images/permalink')
			.respond(200, {condition: false});

			var rejected = false;

			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function () {
				return false;
			})
			.catch(function () {
				rejected = true;
			});

			$httpBackend.flush();
			$timeout.flush();

			$rootScope.$emit('$stateChangeSuccess', {name: 'image'});

			$httpBackend.flush();
			$timeout.flush();

			rejected.should.not.be.true;
		});
	});

	describe('prototype.stateChangeSuccess', function () {
		it('should reject promise on state change', function () {
			$httpBackend.when('GET', 'api/images/permalink')
			.respond(200, {condition: false});

			var rejected = false;

			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, function () {
				return false;
			})
			.catch(function () {
				rejected = true;
			});

			$httpBackend.flush();
			$timeout.flush();

			$rootScope.$emit('$stateChangeSuccess', {name: 'home'});

			$httpBackend.flush();
			$timeout.flush();

			rejected.should.be.true;
		});
	});
});