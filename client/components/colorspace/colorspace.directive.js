/*global angular*/

angular.module('phoenixeye')
.directive('colorspace', colorspace);

colorspace.$inject = [
	'DetectorService'
];

function colorspace (DetectorService) {
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
			if ( ! DetectorService.webgl || ! DetectorService.workers || ! DetectorService.canvas ) {
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