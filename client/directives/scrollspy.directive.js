/*global angular*/

angular.module('phoenixeye')
.directive('scrollspy', scrollspy);

scrollspy.$inject = [
	'$'
];

function scrollspy ($) {
	var directive = {
		restrict: 'A',
		scope: {
			target: '@',
			offset: '@ssOffset'
		},
		link: link
	};

	return directive;

	function link (scope) {
		$('body').scrollspy({
			target: scope.target,
			offset: parseInt(scope.offset, 10)
		});
	}
}