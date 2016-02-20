/*global angular*/

angular.module('phoenixeye')
.directive('collapseToggle', collapseToggle);

function collapseToggle() {
	return {
		restrict: 'E',
		templateUrl: 'components/collapseToggle/collapseToggle.html',
		scope: {
			toggle: '='
		}
	};
}