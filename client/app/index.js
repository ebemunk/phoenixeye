import _ from 'lodash'
import angular from 'angular'
import uiRouter from 'angular-ui-router'
import localStorageService from 'angular-local-storage'
import uiBootstrap from 'angular-ui-bootstrap'

import modules from '../modules'
import config from '../config'
import components from '../components'
import template from './app.html'
import './app.less'

//declare module
const module = angular.module('app', [
	uiRouter,
	localStorageService,
	uiBootstrap,
	modules.home.name,
])
//config blocks
_.map(config.config, module.config)
//run blocks
_.map(config.run, module.run)
//declare components
module.component('app', {
	template,
	restrict: 'E'
})
_.map(components, (component, name) => {
	module.component(name, component)
})
