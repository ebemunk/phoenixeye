import _ from 'lodash'
import angular from 'angular'
import uiRouter from 'angular-ui-router'
import localStorageService from 'angular-local-storage'
import modal from 'angular-ui-bootstrap/src/modal'
import dropdown from 'angular-ui-bootstrap/src/dropdown'

import modules from '../modules'
import config from '../config'
import components from '../components'
import template from './app.html'
import './app.less'

const appModules = _.map(modules, module => module.name)
//declare module
const module = angular.module('app', [
	uiRouter,
	localStorageService,
	modal,
	dropdown,
	...appModules,
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
