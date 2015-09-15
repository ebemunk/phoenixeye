/*global angular*/

angular.module('phoenixeye')
.directive('collapseWhen', collapseWhen);

collapseWhen.$inject = [
	'$'
];

function collapseWhen ($) {
	return {
		restrict: 'A',
		scope: {
			collapseWhen: '='
		},
		link: function (scope, element) {
			scope.$watch('collapseWhen', function (value) {
				if( value ) {
					$(element).stop().slideUp();
				} else {
					$(element).stop().slideDown();
				}
			});
		}
	};
}