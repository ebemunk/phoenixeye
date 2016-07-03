import angular from 'angular'
import ngSanitize from 'angular-sanitize'
import ngAnimate from 'angular-animate'
import uiRouter from 'angular-ui-router'
import ngFileUpload from 'ng-file-upload'
const ngToast = require('script!ng-toast/dist/ngToast.min.js')
require('ng-toast/dist/ngToast.min.css')
require('ng-toast/dist/ngToast-animations.min.css')

import homeComponent from './component'

let homeModule = angular.module('home', [
	ngSanitize,
	ngAnimate,
	uiRouter,
	ngFileUpload,
	'ngToast',
])
.config(HomeConfig)
.component('home', homeComponent)

HomeConfig.$inject = [
	'$urlRouterProvider',
	'$stateProvider'
]

function HomeConfig($urlRouterProvider, $stateProvider) {
	$urlRouterProvider.otherwise('/')

	$stateProvider
	.state('home', {
		url: '/',
		template: '<home></home>'
	})
}

export default homeModule
