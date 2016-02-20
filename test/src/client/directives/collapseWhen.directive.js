/*eslint-env node, mocha*/
/*global inject, sinon*/

'use strict';

describe('Directive: collapseWhen', function () {
	var $compile;
	var $rootScope;
	var $;

	beforeEach(module('phoenixeye'));
	beforeEach(module('templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
		$ = $injector.get('$');
	}));

	it('should call $.fn.slideUp if collapse-when=true', function () {
		var slideUpSpy = sinon.spy($.fn, 'slideUp');
		var slideDownSpy = sinon.spy($.fn, 'slideDown');

		$rootScope.collapse = true;
		$compile('<div collapse-when="collapse">test</div>')($rootScope);
		$rootScope.$digest();

		slideUpSpy.calledOnce.should.be.true;
		slideDownSpy.callCount.should.equal(0);

		slideUpSpy.restore();
		slideDownSpy.restore();
	});

	it('should call $.fn.slideDown if collapse-when=false', function () {
		var slideUpSpy = sinon.spy($.fn, 'slideUp');
		var slideDownSpy = sinon.spy($.fn, 'slideDown');

		$rootScope.collapse = false;
		$compile('<div collapse-when="collapse">test</div>')($rootScope);
		$rootScope.$digest();

		slideDownSpy.calledOnce.should.be.true;
		slideUpSpy.callCount.should.equal(0);

		slideUpSpy.restore();
		slideDownSpy.restore();
	});
});