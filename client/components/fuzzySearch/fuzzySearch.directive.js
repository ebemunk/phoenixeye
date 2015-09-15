/*global angular, injectToThis*/

angular.module('phoenixeye')
.directive('fuzzySearch', fuzzySearch);

function fuzzySearch() {
	return {
		restrict: 'E',
		scope: {
			list: '=',
			filtered: '='
		},
		templateUrl: 'components/fuzzySearch/fuzzySearch.html',
		controller: 'FuzzySearchController',
		controllerAs: 'vm',
		bindToController: true
	};
}

angular.module('phoenixeye')
.controller('FuzzySearchController', FuzzySearchController);

FuzzySearchController.$inject = [
	'$scope',
	'Fuse'
];

FuzzySearchController.$name = 'FuzzySearchController';

function FuzzySearchController () {
	injectToThis(this.constructor).apply(this, arguments);

	var vm = this;

	vm.$scope.$watch('vm.list', function (newV) {
		vm.filtered = newV;

		if( ! newV ) {
			return;
		}

		var fuzzySearchArray = vm.buildFuzzySearchArray(newV);
		vm.fuzzySearch = new vm.Fuse(fuzzySearchArray, {
			keys: ['key', 'val'],
			threshold: 0.4
		});
	});
}

FuzzySearchController.prototype.clear = function () {
	var vm = this;

	vm.search = '';
	vm.filter();
};

FuzzySearchController.prototype.filter = function () {
	var vm = this;

	if( ! vm.search ) {
		vm.filtered = vm.list;
		return;
	}

	var matches = vm.fuzzySearch.search(vm.search).map(function (el) {
		return el.key;
	});

	vm.filtered = vm.buildFilteredObject(matches);
};


FuzzySearchController.prototype.buildFuzzySearchArray = function (obj) {
	var array = [];

	function getKeyVal(key) {
		return {
			key: key,
			val: obj[field][prop][key]
		};
	}

	for( var field in obj ) {
		for( var prop in obj[field] ) {
			array = array.concat(
				Object.keys(obj[field][prop]).map(getKeyVal)
			);
		}
	}

	return array;
};

FuzzySearchController.prototype.buildFilteredObject = function (matches) {
	var vm = this;

	var obj = {};

	for( var field in vm.list ) {
		for( var prop in vm.list[field] ) {
			for( var key in vm.list[field][prop] ) {
				if( matches.indexOf(key) < 0 ) continue;

				if( ! obj[field] ) {
					obj[field] = {};
				}

				if( ! obj[field][prop] ) {
					obj[field][prop] = {};
				}

				obj[field][prop][key] = vm.list[field][prop][key];
			}
		}
	}

	return obj;
};