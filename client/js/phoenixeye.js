'use strict';

angular.module('phoenixeye', [
	'ui.router'
]);

angular.module('phoenixeye')
.config([
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider',
	function ($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl as home'
			})
		;
	}
]);

angular.module('phoenixeye')
.run([
	'$rootScope',
	'$state',
	function ($rootScope, $state) {
		$rootScope.$state = $state;
	}
]);