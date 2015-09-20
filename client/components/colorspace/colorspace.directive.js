/*global angular*/

angular.module('phoenixeye')
.directive('colorspace', colorspace);

function colorspace () {
	return {
		restrict: 'E',
		templateUrl: 'components/colorspace/colorspace.html',
		scope: {
			image: '='
		},
		controller: 'ColorspaceController',
		controllerAs: 'vm',
		bindToController: true,
		link: function(scope, element) {
			if ( ! Detector.webgl || ! Detector.workers || ! Detector.canvas ) {
				scope.vm.disabled = true;

				return;
			}

			scope.vm.element = element;

			var imageDataCanvas = element.find('.image-data');

			scope.$watch('vm.image', function (image, oldVal) {
				if( ! image || angular.equals(image, oldVal) ) {
					return;
				}

				var img = new Image();
				img.src = image.path + '/' + image.fileName;

				img.onload = function () {
					imageDataCanvas
					.attr('height', img.naturalHeight)
					.attr('width', img.naturalWidth);

					var context = imageDataCanvas.get(0).getContext('2d');
					context.drawImage(img, 0, 0);

					scope.vm.pixelData = context.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
				};
			});
		}
	};
}

var Detector = {
	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )(),
	workers: !! window.Worker
};