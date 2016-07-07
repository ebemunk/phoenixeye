import angular from 'angular'

import controller from './controller'
import template from './index.html'

colorspace.$inject = [
	'DetectorService'
]

export default function colorspace(DetectorService) {
	const directive = {
		restrict: 'E',
		controller,
		controllerAs: '$ctrl',
		template,
		scope: {
			image: '='
		},
		link: (scope, element) => {
			if ( ! DetectorService.webgl || ! DetectorService.workers || ! DetectorService.canvas ) {
				scope.$ctrl.disabled = true
				return
			}
			scope.$ctrl.element = element
			const imageDataCanvas = element.find('.image-data')
			scope.$watch('$ctrl.image', (image, oldVal) => {
				if( ! image || angular.equals(image, oldVal) ) return
				const img = new Image()
				img.src = image.path + '/' + image.fileName

				img.onload = () => {
					imageDataCanvas
					.attr('height', img.naturalHeight)
					.attr('width', img.naturalWidth)
					const context = imageDataCanvas.get(0).getContext('2d')
					context.drawImage(img, 0, 0)
					scope.$ctrl.pixelData = context.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
				}
			})
		}
	}
	return directive
}
