import Promise from 'bluebird'
import service from './image.service'
angular.module('ImageService', []).service('ImageService', service)

describe('ImageService', () => {
	let imageService
	let $httpBackend

	beforeEach(angular.mock.module('ImageService'))
	beforeEach(angular.mock.inject($injector => {
		$httpBackend = $injector.get('$httpBackend')
		imageService = $injector.get('ImageService')
	}))

	describe('getAnalyses', () => {
		it('should return a promise', () => {
			$httpBackend
			.expectGET('api/analyses/permalink')
			.respond(200, [])
			const result = imageService.getAnalyses('permalink')
			expect(result).to.have.property('then')
			$httpBackend.flush()
		})

		it('should return a promise with result [analyses, histograms]', () => {
			$httpBackend
			.expectGET('api/analyses/permalink')
			.respond(200, [
				{type: 'ela'},
				{type: 'lg'},
				{type: 'lab_fast'},
				{type: 'hsv'},
				{type: 'copymove'},
				{type: 'avgdist'}
			])
			const p = Promise.resolve(imageService.getAnalyses('permalink'))
			.spread((analyses, histograms) => {
				expect(Object.keys(analyses)).to.have.length(4)
				expect(Object.keys(histograms)).to.have.length(2)
			})
			$httpBackend.flush()
			return p
		})

		it('should sort analyses by createdAt descending', () => {
			$httpBackend.expectGET('api/analyses/permalink')
			.respond(200, [
				{
					type: 'ela',
					createdAt: '2015-09-09T04:51:08.651Z'
				},
				{
					type: 'ela',
					createdAt: '2015-09-12T04:51:08.651Z',
					atTop: true
				}
			])

			const p = Promise.resolve(imageService.getAnalyses('permalink'))
			.spread(function (analyses, histograms) {
				expect(analyses.ela[0].atTop).to.be.true
			})
			$httpBackend.flush()
			return p
		})
	})
})
