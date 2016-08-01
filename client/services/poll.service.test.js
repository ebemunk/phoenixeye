import Promise from 'bluebird'
import service from './poll.service'
angular.module('PollService', []).service('PollService', service)

describe('PollService', () => {
	let PollService
	let $httpBackend
	let $timeout
	let $rootScope
	let $http

	beforeEach(angular.mock.module('PollService'))
	beforeEach(angular.mock.inject($injector => {
		PollService = $injector.get('PollService')
		$httpBackend = $injector.get('$httpBackend')
		$timeout = $injector.get('$timeout')
		$rootScope = $injector.get('$rootScope')
		$http = $injector.get('$http')
	}))

	describe('pollUntil', () => {
		it('should return a promise', () => {
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {})
			const p = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, () => false)
			$timeout.flush()
			$httpBackend.flush()
			expect(p).to.be.an.instanceof(Promise)
		})

		it('should call $http with the config given', () => {
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {})
			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, () => true)
			$httpBackend.flush()
			$timeout.flush()
			$httpBackend.verifyNoOutstandingExpectation()
			$httpBackend.verifyNoOutstandingRequest()
		})

		it('should reject promise on server error', () => {
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(400, {})
			const p = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, () => true)
			$httpBackend.flush()
			$timeout.flush()
			$httpBackend.verifyNoOutstandingExpectation()
			$httpBackend.verifyNoOutstandingRequest()
			return expect(p).to.be.rejected
		})

		it('should keep polling until condition fn returns true', () => {
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {condition: false})
			PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, resp => resp.data.condition)
			$timeout.flush()
			$httpBackend.flush()
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {condition: true})
			$timeout.flush()
			$httpBackend.flush()
			$httpBackend.verifyNoOutstandingExpectation()
			$httpBackend.verifyNoOutstandingRequest()
		})

		it('should resolve promise once condition fn returns true', () => {
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {condition: true})
			const p = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, resp => resp.data.condition)
			$timeout.flush()
			$httpBackend.flush()
			return expect(p).to.be.resolved
		})

		it('should not stop poll if new state change is the same image', () => {
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {condition: false})
			const p = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, resp => resp.data.condition)
			$httpBackend.flush()
			$httpBackend
			.expectGET('api/images/permalink')
			.respond(200, {condition: true})
			$timeout.flush()
			$httpBackend.flush()
			$rootScope.$emit('$stateChangeSuccess', {name: 'image'}, {permalink: 'permalink'}, null, {permalink: 'permalink'})
			return expect(p).to.be.fulfilled
		})

		it('should stop poll if new state change is a different image', () => {
			$httpBackend
			.whenGET('api/images/permalink')
			.respond(200, {condition: false})
			const p = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, resp => resp.data.condition)
			$httpBackend.flush()
			$timeout.flush()
			$rootScope.$emit('$stateChangeSuccess', {name: 'image'}, {permalink: 'permalink'}, null, {permalink: 'no'})
			$httpBackend.flush()
			$timeout.flush()
			return expect(p).to.be.rejected
		})

		it('should stop poll if new state change is not image', () => {
			$httpBackend
			.whenGET('api/images/permalink')
			.respond(200, {condition: false})
			const p = PollService.pollUntil({
				method: 'get',
				url: 'api/images/permalink'
			}, resp => resp.condition)
			$httpBackend.flush()
			$timeout.flush()
			$rootScope.$emit('$stateChangeSuccess', {name: 'da'})
			$httpBackend.flush()
			$timeout.flush()
			return expect(p).to.be.rejected
		})
	})
})
