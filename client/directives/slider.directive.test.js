import sinon from 'sinon'
import $ from 'jquery'
import directive from './slider.directive'
angular.module('slider', []).directive('slider', directive)

describe('slider', () => {
	let $compile
	let scope

	beforeEach(angular.mock.module('slider'))
	beforeEach(angular.mock.inject($injector => {
		$compile = $injector.get('$compile')
		scope = $injector.get('$rootScope').$new()
	}))

	afterEach(() => {
	})

	it('should require ngModel', () => {
		expect(() => {
			$compile('<slider start="start" range="range"></slider>')(scope)
		}).to.throw()
	})

	it('should initialize noUiSlider', () => {
		scope.start = [0]
		scope.range = {
			min: [1],
			max: [100]
		}
		const element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope)
		scope.$digest()
		expect(element[0].noUiSlider).to.exist
	})

	it('should update ngModel when slider value updates', () => {
		scope.start = [0]
		scope.range = {
			min: [1],
			max: [100]
		}
		const element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope)
		scope.$digest()
		element[0].noUiSlider.set([25])
		scope.$digest()
		expect(scope.myModel).to.equal('25.00')
	})

	it('should update slider when ngModel value is changed', () => {
		scope.start = [0]
		scope.range = {
			min: [1],
			max: [100]
		}
		const element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope)
		scope.$digest()
		scope.myModel = 30
		scope.$digest()
		expect(element[0].noUiSlider.get()).to.equal('30.00')
	})


	it('should re-initialize the slider if any option changes', () => {
		scope.start = [0]
		scope.range = {
			min: [1],
			max: [100]
		}
		const element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope)
		scope.$digest()
		const destroySpy = sinon.spy(element[0].noUiSlider, 'destroy')
		scope.range = {
			min: [1],
			max: [25]
		}
		scope.$digest()
		expect(destroySpy.calledOnce).to.be.true
		expect(element[0].noUiSlider).to.exist
		destroySpy.restore()
	})

	it('should destroy the slider if scope is destroyed', () => {
		scope.start = [0]
		scope.range = {
			min: [1],
			max: [100]
		}
		const element = $compile('<slider start="start" range="range" ng-model="myModel"></slider>')(scope)
		scope.$digest()
		const destroySpy = sinon.spy(element[0].noUiSlider, 'destroy')
		scope.$destroy()
		expect(destroySpy.calledOnce).to.be.true
		expect(element[0].noUiSlider).to.not.exist
		destroySpy.restore()
	})

	it('should use custom integer formatter if formatInteger is true', () => {
		scope.start = [0]
		scope.range = {
			min: [1],
			max: [100]
		}
		const element = $compile('<slider start="start" range="range" ng-model="myModel" format-integer="true"></slider>')(scope)
		scope.$digest()
		element[0].noUiSlider.set([25])
		scope.$digest()
		expect(scope.myModel).to.equal(25)
	})
})
