import sinon from 'sinon'
import $ from 'jquery'
import directive from './overlay.directive'
angular.module('overlay', []).directive('overlay', directive)

describe('overlay', () => {
	let $compile
	let scope
	let onSpy
	let offSpy

	beforeEach(angular.mock.module('overlay'))
	beforeEach(angular.mock.inject($injector => {
		$compile = $injector.get('$compile')
		scope = $injector.get('$rootScope').$new()
		onSpy = sinon.spy(angular.element.prototype, 'on')
		offSpy = sinon.spy(angular.element.prototype, 'off')
	}))

	afterEach(() => {
		onSpy.restore()
		offSpy.restore()
	})

	it('should throw an error if used for anything other than img element', () => {
		expect(() => {
			$compile('<p overlay></p>')(scope)
		}).to.throw()
	})

	it('should return an overlay control object', () => {
		$compile('<img overlay="overlay">')(scope)
		scope.$digest()
		expect(scope.overlay.toggle).to.be.a('function')
		expect(scope.overlay.active).to.be.false
		expect(scope.overlay.opacity).to.be.equal(50)
	})

	it('should set display and opacity css attributes on toggle', () => {
		const element = $compile('<img overlay="overlay">')(scope)
		scope.$digest()
		expect(element.css('display')).to.be.equal('none')
		scope.overlay.toggle()
		expect(element.css('display')).to.be.equal('block')
		expect(element.css('opacity')).to.be.equal('0.5')
	})

	it('should setup or teardown mousewheel handler on toggle', () => {
		$compile('<img overlay="overlay">')(scope)
		scope.$digest()
		scope.overlay.toggle()
		expect(onSpy.calledWith('mousewheel')).to.be.true
		scope.overlay.toggle()
		expect(offSpy.calledWith('mousewheel')).to.be.true
	})

	it('should change opacity on mousewheel', () => {
		const element = $compile('<img overlay="overlay">')(scope)
		scope.$digest()
		scope.overlay.toggle()
		const wheelEvt = $.Event('mousewheel')
		wheelEvt.originalEvent = {deltaY: 1}
		wheelEvt.preventDefault = () => {}
		element.triggerHandler(wheelEvt)
		expect(element.css('opacity')).to.be.equal('0.55')
		wheelEvt.originalEvent = {deltaY: -1}
		element.triggerHandler(wheelEvt)
		element.triggerHandler(wheelEvt)
		expect(element.css('opacity')).to.be.equal('0.45')
	})
})
