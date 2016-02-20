/*global angular*/

angular.module('phoenixeye')
.directive('collapseWhen', collapseWhen);

collapseWhen.$inject = [
	'$'
];

function collapseWhen ($) {
	var directive = {
		restrict: 'A',
		scope: {
			collapseWhen: '='
		},
		link: link
	};

	return directive;

	function link (scope, element) {
		scope.$watch('collapseWhen', function (value) {
			if( value ) {
				$(element).stop().slideUp();
			} else {
				$(element).stop().slideDown();
			}
		});
	}
}