'use strict';

describe('Directive: collapseToggle', function () {
	var $compile;
	var $rootScope;
	var $;

	beforeEach(module('phoenixeye'));
	beforeEach(module('phoenixeye'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
		$ = $injector.get('$');
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