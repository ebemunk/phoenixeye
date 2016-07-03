import angular from 'angular'
import uiRouter from 'angular-ui-router'

import fofComponent from './component'

let fofModule = angular.module('404', [
	uiRouter,
])
.config(FofConfig)
.component('fof', fofComponent)

FofConfig.$inject = [
	'$stateProvider',
]

function FofConfig($stateProvider) {
	$stateProvider
	.state('404', {
		template: '<fof></fof>'
	})
}

export default fofModule
