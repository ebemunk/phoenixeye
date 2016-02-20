/*eslint-env node, mocha*/
/*global inject*/

'use strict';

describe('Directive: collapseToggle', function () {
	var $compile;
	var scope;
	var $;

	beforeEach(module('phoenixeye'));
	beforeEach(module('phoenixeye'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		scope = $injector.get('$rootScope').$new();
		$ = $injector.get('$');
	}));

	it('should toggle "toggle" attr value in scope', function () {
		var element = $compile('<collapse-toggle toggle="collapse">test</div>')(scope);

		scope.$digest();
		$(element).find('i').click();
		scope.$digest();

		scope.collapse.should.be.true;

		scope.$digest();
		$(element).find('i').click();
		scope.$digest();

		scope.collapse.should.be.false;
	});
});