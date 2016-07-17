import directive from './collapseWhen.directive'
angular.module('collapseWhen', []).directive('collapseWhen', directive)

describe('collapseWhen', () => {
	let $compile
	let $rootScope
	let upSpy
	let downSpy

	beforeEach(angular.mock.module('collapseWhen'))
	beforeEach(angular.mock.inject($injector => {
		$compile = $injector.get('$compile')
		$rootScope = $injector.get('$rootScope')
		upSpy = sinon.spy(directive.__GetDependency__('$').fn, 'slideUp')
		downSpy = sinon.spy(directive.__GetDependency__('$').fn, 'slideDown')
	}))

	afterEach(() => {
		upSpy.restore()
		downSpy.restore()
	})

	it('should call $.fn.slideUp if collapse-when=true', () => {
		$rootScope.collapse = true
		$compile('<div collapse-when="collapse">test</div>')($rootScope)
		$rootScope.$digest()
		expect(upSpy.calledOnce).to.be.true
		expect(downSpy.callCount).to.equal(0)
	})

	it('should call $.fn.slideDown if collapse-when=false', () => {
		$rootScope.collapse = false
		$compile('<div collapse-when="collapse">test</div>')($rootScope)
		$rootScope.$digest()
		expect(downSpy.calledOnce).to.be.true
		expect(upSpy.callCount).to.equal(0)
	})
})
