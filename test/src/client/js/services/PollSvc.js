describe('PollSvc', function () {
	var PollSvc;
	var $httpBackend,
		$timeout,
		$rootScope
	;

	beforeEach(module('phoenixeye'));

	beforeEach(module(function ($urlRouterProvider) {
		$urlRouterProvider.deferIntercept();
	}));

	beforeEach(inject(function ($injector) {
		PollSvc = $injector.get('PollSvc');
		$httpBackend = $injector.get('$httpBackend');
		$timeout = $injector.get('$timeout');
		$rootScope = $injector.get('$rootScope');
	}));

	describe('pollUntil', function () {
		it('should return a promise', function (done) {
			var promise = PollSvc.pollUntil({
				method: 'get',
				url: '/images'
			}, function (resp) {
				return false;
			});

			expect(promise).to.have.property('promise');

			done();
		});

		it('should call $http with the config given', function (done) {
			$httpBackend.expectGET('/api/images/permalink')
				.respond(200, {});

			PollSvc.pollUntil({
				method: 'get',
				url: '/api/images/permalink'
			}, function (resp) {
				return true;
			});

			$httpBackend.flush();
			$timeout.flush();

			done();
		});

		it('should reject promise on server error', function (done) {
			$httpBackend.expectGET('/api/images/permalink')
				.respond(400, {});

			var rejected = false;

			PollSvc.pollUntil({
				method: 'get',
				url: '/api/images/permalink'
			}, function (resp) {
				return true;
			}).promise.catch(function (resp) {
				rejected = true;
			});

			$httpBackend.flush();
			$timeout.flush();

			expect(rejected).to.be.true;

			done();
		});

		it('should keep polling until condition fn returns true', function (done) {
			$httpBackend.expect('GET', '/api/images/permalink')
				.respond(200, {condition: false});
			PollSvc.pollUntil({
				method: 'get',
				url: '/api/images/permalink'
			}, function (resp) {
				return resp.condition;
			});

			$timeout.flush();
			$httpBackend.flush();

			$httpBackend.expect('GET', '/api/images/permalink')
				.respond(200, {condition: true});

			$timeout.flush();
			$httpBackend.flush();

			done();
		});

		it('should resolve promise once condition fn returns true', function (done) {
			$httpBackend.expect('GET', '/api/images/permalink')
				.respond(200, {condition: true});

			PollSvc.pollUntil({
				method: 'get',
				url: '/api/images/permalink'
			}, function (resp) {
				return resp.condition;
			});

			$timeout.flush();
			$httpBackend.flush();
			done();
		});

		it('should reject promise on state change', function (done) {
			$httpBackend.when('GET', '/api/images/permalink')
				.respond(200, {condition: false});

			var rejected = false;

			PollSvc.pollUntil({
				method: 'get',
				url: '/api/images/permalink'
			}, function (resp) {
				return false;
			}).promise.catch(
				function (resp) {
					rejected = true;
				}
			);

			$httpBackend.flush();
			$timeout.flush();

			$rootScope.$emit('$stateChangeSuccess');

			$httpBackend.flush();
			$timeout.flush();

			expect(rejected).to.be.true;

			done();
		});
	});
});