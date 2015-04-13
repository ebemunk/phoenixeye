angular.module('phoenixeye')
.directive('collapseWhen', [
	function collapseWhen() {
		return {
			restrict: 'A',
			link: function(scope, elem, attrs) {
				scope.$watch(attrs.collapseWhen, function (newV) {
					if( newV ) {
						$(elem).slideUp();
					} else {
						$(elem).slideDown();
					}
				});
			}
		}
	}
])
.directive('collapseToggle', [
	function collapseToggle() {
		return {
			restrict: 'E',
			templateUrl: 'html/partials/collapseToggle.html',
			scope: {
				toggle: '='
			}
		}
	}
]);