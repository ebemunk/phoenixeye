import directive from './magnifier.directive'
angular.module('magnifier', []).directive('magnifier', directive)

describe('magnifier', () => {
	let $compile
	let $rootScope
	let onSpy
	let offSpy

	beforeEach(angular.mock.module('magnifier'))
	beforeEach(angular.mock.inject($injector => {
		$compile = $injector.get('$compile')
		$rootScope = $injector.get('$rootScope')
		onSpy = sinon.spy(directive.__GetDependency__('$').fn, 'on')
		offSpy = sinon.spy(directive.__GetDependency__('$').fn, 'off')
	}))

	afterEach(() => {
		onSpy.restore()
		offSpy.restore()
	})

	it('should return an magnifier control object', () => {
		$compile('<div magnifier="myMagnifier" target="#selector"></div>')($rootScope)
		$rootScope.$digest()
		expect($rootScope.myMagnifier.toggle).to.be.a('function')
		expect($rootScope.myMagnifier.active).to.be.false
		expect($rootScope.myMagnifier.power).to.be.equal(2)
	})

	it('should set display css attribute on toggle', () => {
		const element = $compile('<div magnifier="myMagnifier" target="#selector"></div>')($rootScope)
		$rootScope.$digest()
		expect(element.css('display')).to.be.equal('none')
		$rootScope.myMagnifier.toggle()
		expect(element.css('display')).to.be.equal('block')
	})

	it('should setup or teardown mousewheel and mousemove handlers on toggle', () => {
		$compile('<div magnifier="myMagnifier" target="#selector"></div>')($rootScope)
		$rootScope.$digest()
		$rootScope.myMagnifier.toggle()
		expect(onSpy.calledWith('mousewheel')).to.be.true
		expect(onSpy.calledWith('mousemove')).to.be.true
		$rootScope.myMagnifier.toggle()
		expect(offSpy.calledWith('mousewheel')).to.be.true
		expect(offSpy.calledWith('mousemove')).to.be.true
	})

	it('should change background-image if target image src changes', () => {
		$rootScope.imageSrc = 'a/b.jpg'
		const img = $compile('<img id="theImage" ng-src="{{imageSrc}}">')($rootScope)
		angular.element(document).find('body').append(img)
		const element = $compile('<div magnifier="myMagnifier" target="#theImage"></div>')($rootScope)
		$rootScope.$digest()
		$rootScope.myMagnifier.toggle()
		$rootScope.imageSrc = 'c/d.jpg'
		$rootScope.$digest()
		expect(element.css('background-image')).to.contain('c/d.jpg')
	})

	it('should change zoom power on mousewheel', () => {
		const img = $compile('<img id="theImage">')($rootScope)
		angular.element(document).find('body').append(img)
		const target = angular.element(document).find('#theImage')
		$compile('<div magnifier="myMagnifier" target="#theImage"></div>')($rootScope)
		$rootScope.$digest()
		$rootScope.myMagnifier.toggle()
		const mwEvent = new window.MouseEvent('mousewheel')
		mwEvent.deltaY = 1
		document.getElementById('theImage').dispatchEvent(mwEvent)
		document.getElementById('theImage').dispatchEvent(mwEvent)
		expect($rootScope.myMagnifier.power).to.be.equal(8)
		mwEvent.deltaY = -1
		document.getElementById('theImage').dispatchEvent(mwEvent)
		expect($rootScope.myMagnifier.power).to.be.equal(4)
	})
})
