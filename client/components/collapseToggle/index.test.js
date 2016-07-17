import sinon from 'sinon'
import $ from 'jquery'
import component from './'
angular.module('collapseToggle', []).component('collapseToggle', component)

describe('collapseToggle', () => {
	let $compile
	let scope

	beforeEach(angular.mock.module('collapseToggle'))
	beforeEach(angular.mock.inject($injector => {
		$compile = $injector.get('$compile')
		scope = $injector.get('$rootScope').$new()
	}))

	it('should toggle "toggle" attr value in scope', () => {
		const element = $compile('<collapse-toggle toggle="collapse">test</div>')(scope)
		angular.element(document).find('body').append(element)
		scope.$digest()
		$(element).find('i').click()
		scope.$digest()
		expect(scope.collapse).to.be.true
		scope.$digest()
		$(element).find('i').click()
		scope.$digest()
		expect(scope.collapse).to.be.false
	})
})
