/*eslint-env node, mocha*/
/*global inject*/

'use strict';

describe.skip('Directive: colorspace', function () {
	var $compile;
	var scope;
	// var controller;

	// beforeEach(module('phoenixeye'));
	// beforeEach(module('templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		scope = $injector.get('$rootScope').$new();
		// controller = $injector.get('$controller')('ColorspaceController', {$scope: scope});
	}));

	it('should be disabled if no browser support', function () {
		var element = $compile('<colorspace image="img"></colorspace>')(scope);
		// scope.$digest();
		element.controller('ColorspaceController');
		// console.log(angular.element(element).controller('ColorspaceController'));
		// controller.disabled.should.be.true;
	});
});