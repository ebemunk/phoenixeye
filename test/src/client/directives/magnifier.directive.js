/*eslint-env node, mocha*/
/*global inject, angular, sinon*/

'use strict';

describe('Directive: magnifier', function () {
	var $;
	var $compile;
	var scope;

	beforeEach(module('phoenixeye'));
	beforeEach(module('templates'));

	beforeEach(inject(function ($injector) {
		$ = $injector.get('$');
		$compile = $injector.get('$compile');
		scope = $injector.get('$rootScope').$new();
	}));

	it('should return an magnifier control object', function () {
		$compile('<div magnifier="myMagnifier" target="#selector"></div>')(scope);

		scope.$digest();

		scope.myMagnifier.toggle.should.be.a('function');
		scope.myMagnifier.active.should.be.false;
		scope.myMagnifier.power.should.be.equal(2);
	});

	it('should set display css attribute on toggle', function () {
		var element = $compile('<div magnifier="myMagnifier" target="#selector"></div>')(scope);

		scope.$digest();

		element.css('display').should.be.equal('none');

		scope.myMagnifier.toggle();

		element.css('display').should.be.equal('block');
	});

	it('should setup or teardown mousewheel and mousemove handlers on toggle', function () {
		$compile('<div magnifier="myMagnifier" target="#selector"></div>')(scope);

		var onSpy = sinon.spy($.fn, 'on');
		var offSpy = sinon.spy($.fn, 'off');

		scope.$digest();
		scope.myMagnifier.toggle();

		onSpy.calledWith('mousewheel').should.be.true;
		onSpy.calledWith('mousemove').should.be.true;

		scope.myMagnifier.toggle();

		offSpy.calledWith('mousewheel').should.be.true;
		offSpy.calledWith('mousemove').should.be.true;

		onSpy.restore();
		offSpy.restore();
	});

	it('should change background-image if target image src changes', function () {
		scope.imageSrc = 'a/b.jpg';

		var img = $compile('<img id="theImage" ng-src="{{imageSrc}}">')(scope);
		angular.element(document).find('body').append(img);

		var element = $compile('<div magnifier="myMagnifier" target="#theImage"></div>')(scope);

		scope.$digest();
		scope.myMagnifier.toggle();
		scope.imageSrc = 'c/d.jpg';
		scope.$digest();

		element.css('background-image').should.contain('c/d.jpg');
	});

	it('should change zoom power on mousewheel', function () {
		scope.imageSrc = 'a/b.jpg';

		var img = $compile('<img id="theImage" ng-src="{{imageSrc}}">')(scope);
		angular.element(document).find('body').append(img);
		var target = angular.element(document).find('#theImage');

		$compile('<div magnifier="myMagnifier" target="#theImage"></div>')(scope);

		scope.$digest();
		scope.myMagnifier.toggle();

		target.trigger({
			type: 'mousewheel',
			deltaY: 1
		});
		target.trigger({
			type: 'mousewheel',
			deltaY: 1
		});

		scope.myMagnifier.power.should.be.equal(8);

		target.trigger({
			type: 'mousewheel',
			deltaY: -1
		});

		scope.myMagnifier.power.should.be.equal(4);
	});
});