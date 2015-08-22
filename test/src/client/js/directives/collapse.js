'use strict';

describe('collapseWhen', function () {
	var $compile;
	var $rootScope;

	beforeEach(module('phoenixeye'));
	beforeEach(module('phoenixeye.templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
	}));

	it('should call $.fn.slideUp if collapse-when=true', function () {
		var slideUpSpy = sinon.spy($.fn, 'slideUp');
		var slideDownSpy = sinon.spy($.fn, 'slideDown');

		$rootScope.collapse = true;
		var element = $compile('<div collapse-when="collapse">test</div>')($rootScope);
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
		var element = $compile('<div collapse-when="collapse">test</div>')($rootScope);
		$rootScope.$digest();

		slideDownSpy.calledOnce.should.be.true;
		slideUpSpy.callCount.should.equal(0);

		slideUpSpy.restore();
		slideDownSpy.restore();
	});
});

describe('collapseToggle', function () {
	var $compile;
	var $rootScope;

	beforeEach(module('phoenixeye'));
	beforeEach(module('phoenixeye.templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
	}));

	it('should toggle "toggle" attr value in scope', function () {
		var element = $compile('<collapse-toggle toggle="collapse">test</div>')($rootScope);

		$rootScope.$digest();
		$(element).find('i').click();
		$rootScope.$digest();

		$rootScope.collapse.should.be.true;

		$rootScope.$digest();
		$(element).find('i').click();
		$rootScope.$digest();

		$rootScope.collapse.should.be.false;
	});
});