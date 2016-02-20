/*global angular*/

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