angular.module('phoenixeye')
.directive('fuzzySearch', [
	function fuzzySearch() {
		return {
			restrict: 'E',
			scope: {
				list: '=',
				filtered: '='
			},
			templateUrl: 'html/partials/fuzzySearch.html',
			controller: [
				'$scope',
				function ($scope) {
					var fuzzySearch;

					$scope.$watch('filter', function (newV) {
						if( ! newV ) {
							$scope.filtered = $scope.list;
							return;
						}

						var matches = fuzzySearch.search(newV).map(function (el) {
							return el.key;
						});
						$scope.filtered = buildFilteredObject(matches);
					});

					$scope.$watch('list', function (newV) {
						$scope.filtered = newV;
						if( ! newV ) return;

						var fuzzySearchArray = buildFuzzySearchArray(newV);
						fuzzySearch = new Fuse(fuzzySearchArray, {
							keys: ['key', 'val'],
							threshold: 0.4
						});
					});

					$scope.clear = function() {
						$scope.filter = '';
					};

					function buildFuzzySearchArray(obj) {
						var array = [];

						for( var field in obj ) {
							for( var prop in obj[field] ) {
								array = array.concat(
									Object.keys(obj[field][prop])
										.map(function (key) {
											return {
												key: key,
												val: obj[field][prop][key]
											};
										})
								);
							}
						}

						return array;
					}

					function buildFilteredObject(matches) {
						var obj = {};

						for( var field in $scope.list ) {
							for( var prop in $scope.list[field] ) {
								for( var key in $scope.list[field][prop] ) {
									if( matches.indexOf(key) < 0 ) continue;

									if( ! obj[field] ) obj[field] = {};
									if( ! obj[field][prop] ) obj[field][prop] = {};

									obj[field][prop][key] = $scope.list[field][prop][key];
								}
							}
						}

						return obj;
					}
				}
			]
		}
	}
]);