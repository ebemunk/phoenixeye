import sinon from 'sinon'
import $ from 'jquery'
import component from './'
angular.module('fuzzySearch', []).component('fuzzySearch', component)

describe('fuzzySearch', () => {
	let $compile
	let scope

	beforeEach(angular.mock.module('fuzzySearch'))
	beforeEach(angular.mock.inject($injector => {
		$compile = $injector.get('$compile')
		scope = $injector.get('$rootScope').$new()
	}))

	it('should filter out items using Fuse', () => {
		scope.list = {
			A1: {
				B1: {
					C1: 'c1',
					C2: 'c2',
					C3: 'c3'
				}
			},
			A2: {
				B1: {
					C1: 'c1',
					Derp: 'derp'
				}
			}
		}
		const element = $compile('<fuzzy-search list="list" filtered="filtered"></fuzzy-search>')(scope)
		scope.$digest()
		expect(scope.filtered).to.equal(scope.list)
		const elementScope = element.isolateScope()
		elementScope.$ctrl.search = 'derp'
		elementScope.$ctrl.filter()
		elementScope.$apply()
		expect(scope.filtered).to.eql({
			A2: {
				B1: {
					Derp: 'derp'
				}
			}
		})
	})

	it('should clear filter', () => {
		scope.list = {
			A1: {
				B1: {
					C1: 'c1'
				}
			}
		}
		const element = $compile('<fuzzy-search list="list" filtered="filtered"></fuzzy-search>')(scope)
		scope.$digest()
		const elementScope = element.isolateScope()
		elementScope.$ctrl.search = 'zzzz'
		elementScope.$ctrl.filter()
		elementScope.$apply()
		expect(elementScope.$ctrl.filtered).to.eql({})
		elementScope.$ctrl.clear()
		elementScope.$apply()
		expect(elementScope.$ctrl.filtered).to.eql(scope.list)
	})
})
