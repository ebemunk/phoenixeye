import angular from 'angular'
import uiRouter from 'angular-ui-router'
import ngMap from 'ngmap'

import imageComponent from './component'
import filters from '../../filters'
import {collapseWhen, slider, overlay, magnifier} from '../../directives'
import {PollService, ImageService, GPSService} from '../../services'

let imageModule = angular.module('image', [
	uiRouter,
	ngMap,
])
.config(ImageConfig)
.component('imagec', imageComponent)
.filter('bytes', filters.bytes)
.filter('isEmptyObject', filters.isEmptyObject)
.directive('collapseWhen', collapseWhen)
.directive('overlay', overlay)
.directive('slider', slider)
.directive('magnifier', magnifier)
.service('PollService', PollService)
.service('ImageService', ImageService)
.service('GPSService', GPSService)

ImageConfig.$inject = [
	'$stateProvider',
]

function ImageConfig($stateProvider) {
	$stateProvider
	.state('image', {
		url: '/image/:permalink',
		template: '<imagec></imagec>',
		params: {
			image: null,
			jobId: null
		}
	})
}

export default imageModule
