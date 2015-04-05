angular.module('phoenixeye')
.directive('collapseWhen', [
	function () {
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
]);