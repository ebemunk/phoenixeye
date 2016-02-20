/*global angular*/

angular.module('phoenixeye')
.directive('katex', katex);

katex.$inject = [
	'katex'
];

function katex (katex) {
	var directive = {
		restrict: 'E',
		scope: {
		},
		link: link
	};

	return directive;

	function link (scope, element) {
		katex.render(element.text(), element[0]);
	}
}