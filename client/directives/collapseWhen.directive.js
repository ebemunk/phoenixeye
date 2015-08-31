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
		link: function (scope, element, attrs) {
			scope.$watch('collapseWhen', function (value) {
				if( value ) {
					$(element).slideUp();
				} else {
					$(element).slideDown();
				}
			});
		}
	};
}