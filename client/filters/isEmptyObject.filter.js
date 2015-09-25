/*global angular*/

angular.module('phoenixeye')
.filter('isEmptyObject', isEmptyObjectFilter);

function isEmptyObjectFilter () {
	return filter;

	function filter (value) {
		return angular.equals(value, {});
	}
}