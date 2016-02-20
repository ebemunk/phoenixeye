/*eslint-env node, mocha*/
/*global inject, should, sinon*/

'use strict';

describe('Directive: overlay', function () {
	var $compile;
	var scope;
	var $;

	beforeEach(module('phoenixeye'));
	beforeEach(module('templates'));

	beforeEach(inject(function ($injector) {
		$ = $injector.get('$');
		$compile = $injector.get('$compile');
		scope = $injector.get('$rootScope').$new();
	}));

	it('should throw an error if used for anything other than img element', function () {
		should.Throw(function () {
			$compile('<p overlay></p>')(scope);
		});
	});

	it('should return an overlay control object', function () {
		$compile('<img overlay="overlay">')(scope);

		scope.$digest();

		scope.overlay.toggle.should.be.a('function');
		scope.overlay.active.should.be.false;
		scope.overlay.opacity.should.be.equal(50);
	});

	it('should set display and opacity css attributes on toggle', function () {
		var element = $compile('<img overlay="overlay">')(scope);

		scope.$digest();

		element.css('display').should.be.equal('none');

		scope.overlay.toggle();

		element.css('display').should.be.equal('block');
		element.css('opacity').should.be.equal('0.5');
	});

	it('should setup or teardown mousewheel handler on toggle', function () {
		$compile('<img overlay="overlay">')(scope);

		var onSpy = sinon.spy($.fn, 'on');
		var offSpy = sinon.spy($.fn, 'off');

		scope.$digest();
		scope.overlay.toggle();

		onSpy.calledWith('mousewheel').should.be.true;

		scope.overlay.toggle();

		offSpy.calledWith('mousewheel').should.be.true;

		onSpy.restore();
		offSpy.restore();
	});

	it('should change opacity on mousewheel', function () {
		var element = $compile('<img overlay="overlay">')(scope);

		scope.$digest();
		scope.overlay.toggle();

		element.trigger({
			type: 'mousewheel',
			deltaY: 1
		});

		element.css('opacity').should.be.equal('0.55');

		element.trigger({
			type: 'mousewheel',
			deltaY: -1
		});
		element.trigger({
			type: 'mousewheel',
			deltaY: -1
		});

		element.css('opacity').should.be.equal('0.45');
	});
});