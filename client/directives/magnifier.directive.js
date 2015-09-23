/*global angular*/

angular.module('phoenixeye')
.directive('magnifier', magnifier);

magnifier.$inject = [
	'$'
];

function magnifier ($) {
	var directive = {
		restrict: 'A',
		scope: {
			magnifier: '=',
			target: '@'
		},
		link: link
	};

	return directive;

	function link (scope, element) {
		scope.magnifier = {
			active: true,
			power: 2
		};

		var target = $(scope.target);
		var imageWatcher;
		var sizeWatcher;

		scope.magnifier.toggle = toggle;

		toggle();

		function toggle () {
			if( ! scope.magnifier.active ) {
				scope.magnifier.active = true;

				imageWatcher = scope.$watch(function () {
					return target.attr('src');
				}, adjustImage);
				sizeWatcher = scope.$watch(function () {
					return target.attr('class');
				}, adjustSize);

				target
				.on('mousemove', move)
				.on('mousewheel', zoom);
			} else {
				scope.magnifier.active = false;

				imageWatcher && imageWatcher();
				sizeWatcher && sizeWatcher();

				target
				.off('mousemove')
				.off('mousewheel');
			}

			element.css({
				display: scope.magnifier.active ? '' : 'none'
			});
		}

		function adjustImage (src) {
			element.css({
				'background-image': 'url(' + src + ')'
			});

			adjustSize();
		}

		function adjustSize () {
			var x = target.width() * scope.magnifier.power;
			var y = target.height() * scope.magnifier.power;

			element.css({
				'background-size': x + 'px ' + y + 'px'
			});
		}

		function move (e) {
			var offset = target.offset();
			var width = element.width() / 2;
			var height = element.height() / 2;

			var left = e.pageX - offset.left - width;
			var top = e.pageY - offset.top - height;
			var x = -(e.pageX - offset.left) * scope.magnifier.power + width;
			var y = -(e.pageY - offset.top) * scope.magnifier.power + height;

			element.css({
				left: left,
				top: top,
				'background-position': x + 'px ' + y + 'px'
			});
		}

		function zoom (e) {
			e.preventDefault();

			if( e.deltaY > 0 ) {
				scope.magnifier.power = Math.min(scope.magnifier.power * 2, 128);
			} else {
				scope.magnifier.power = Math.max(1, scope.magnifier.power / 2);
			}

			scope.$apply(scope.magnifier);

			adjustSize();
			move(e);
		}
	}
}