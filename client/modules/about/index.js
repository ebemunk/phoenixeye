import angular from 'angular'
import uiRouter from 'angular-ui-router'
import angularScroll from 'angular-scroll'
require('script!angular-ui-scrollpoint/dist/scrollpoint.min.js')

import aboutComponent from './component'

let aboutModule = angular.module('about', [
	uiRouter,
	angularScroll,
	'ui.scrollpoint',
])
.config(AboutConfig)
.component('about', aboutComponent)

AboutConfig.$inject = [
	'$stateProvider',
]

function AboutConfig($stateProvider) {
	$stateProvider
	.state('about', {
		url: '/about',
		template: '<about></about>'
	})
}

export default aboutModule
