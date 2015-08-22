(function () {

'use strict';

var dbg = debug('app:phoenixeye');

angular.module('phoenixeye', [
	'ui.router',
	'ngFileUpload',
	'ngToast',
	'ui.bootstrap',
	'ui.bootstrap-slider',
	'ngMap',
	'angular-loading-bar',
	'angular.filter'
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

		$urlRouterProvider.otherwise('/');
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

})();