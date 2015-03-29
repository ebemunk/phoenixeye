'use strict';

angular.module('phoenixeye', [
	'ui.router',
	'angularFileUpload',
	'ngToast'
]);

angular.module('phoenixeye')
.config([
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider',
	function config($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'html/templates/home.html',
				controller: 'HomeCtrl'
			})
			.state('image', {
				url: '/image/:permalink',
				templateUrl: 'html/templates/image.html',
				controller: 'ImageCtrl',
				params: {
					image: null,
					jobId: null
				}
			})
		;
	}
]);

angular.module('phoenixeye')
.run([
	'$rootScope',
	'$state',
	function run($rootScope, $state) {
		$rootScope.$state = $state;
	}
]);