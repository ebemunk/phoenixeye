/*global angular*/

angular.module('phoenixeye')
.controller('FuzzySearchController', FuzzySearchController);

FuzzySearchController.$inject = [
	'debug',
	'$scope',
	'Fuse'
];

function FuzzySearchController (debug, $scope, Fuse) {
	debug = debug('app:FuzzySearchController');

	var vm = this;

	vm.clear = clear;
	vm.filter = filter;

	$scope.$watch('vm.list', listWatcher);

	function listWatcher (list) {
		vm.filtered = list;

		if( ! list ) {
			return;
		}

		var fuzzySearchArray = buildFuzzySearchArray(list);
		vm.fuzzySearch = new Fuse(fuzzySearchArray, {
			keys: ['key', 'val'],
			threshold: 0.4
		});
	}

	function clear () {
		vm.search = '';
		filter();
	}

	function filter () {
		if( ! vm.search ) {
			vm.filtered = vm.list;
			return;
		}

		var matches = vm.fuzzySearch.search(vm.search).map(function (el) {
			return el.key;
		});

		vm.filtered = buildFilteredObject(matches);
	}

	function buildFuzzySearchArray (obj) {
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
	}

	function buildFilteredObject (matches) {
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
	}
}