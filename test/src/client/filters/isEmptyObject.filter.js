/*eslint-env node, mocha*/
/*global inject, sinon, angular*/

'use strict';

describe('Filter: isEmptyObject', function () {
	beforeEach(module('phoenixeye'));

	var isEmptyObject;
	beforeEach(inject(function ($filter) {
		isEmptyObject = $filter('isEmptyObject');
	}));

	it('should call angular.equals to check if object is empty', function () {
		var equalsSpy = sinon.spy(angular, 'equals');

		var obj = {
			hi: 'hello'
		};

		isEmptyObject(obj).should.equal(false);
		equalsSpy.calledWithExactly(obj, {}).should.be.true;
	});
});