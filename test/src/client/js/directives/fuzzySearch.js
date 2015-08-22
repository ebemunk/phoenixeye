'use strict';

describe('fuzzySearch', function () {
	var $compile;
	var $rootScope;

	beforeEach(module('phoenixeye'));
	beforeEach(module('phoenixeye.templates'));

	beforeEach(inject(function ($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
	}));

	it('should filter out items using Fuse', function () {
		$rootScope.list = {
			A1: {
				B1: {
					C1: 'c1',
					C2: 'c2',
					C3: 'c3'
				}
			},
			A2: {
				B1: {
					C1: 'c1',
					Derp: 'derp'
				}
			}
		};

		var element = $compile('<fuzzy-search list="list" filtered="filtered"></fuzzy-search>')($rootScope);

		$rootScope.$digest();
		$rootScope.filtered.should.equal($rootScope.list);

		var elementScope = element.isolateScope();
		elementScope.filter = 'derp';
		elementScope.$apply();

		$rootScope.filtered.should.eql({
			A2: {
				B1: {
					Derp: 'derp'
				}
			}
		});
	});

	it('should clear filter', function () {
		$rootScope.list = {
			A1: {
				B1: {
					C1: 'c1'
				}
			}
		};

		var element = $compile('<fuzzy-search list="list" filtered="filtered"></fuzzy-search>')($rootScope);

		$rootScope.$digest();

		var elementScope = element.isolateScope();
		elementScope.filter = 'zzzz';
		elementScope.$apply();

		$rootScope.filtered.should.eql({});

		elementScope.clear();
		elementScope.$apply();

		$rootScope.filtered.should.eql($rootScope.list);
	});
});