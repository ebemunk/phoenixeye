import angular from 'angular'
import uiRouter from 'angular-ui-router'
import angularScroll from 'angular-scroll'
require('script!angular-ui-scrollpoint/dist/scrollpoint.min.js')

import infoComponent from './component'
import {katex} from '../../directives'

let infoModule = angular.module('info', [
	uiRouter,
	angularScroll,
	'ui.scrollpoint',
])
.config(InfoConfig)
.component('info', infoComponent)
.directive('katex', katex)

InfoConfig.$inject = [
	'$stateProvider',
]

function InfoConfig($stateProvider) {
	$stateProvider
	.state('info', {
		url: '/info',
		template: '<info></info>'
	})
}

export default infoModule
