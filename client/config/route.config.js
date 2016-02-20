/*global angular*/

angular.module('phoenixeye').config(RouteConfig);

RouteConfig.$inject = [
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider'
];

function RouteConfig ($stateProvider, $urlRouterProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'views/home/home.html',
			controller: 'HomeController',
			controllerAs: 'vm'
		})
		.state('image', {
			url: '/image/:permalink',
			templateUrl: 'views/image/image.html',
			controller: 'ImageController',
			controllerAs: 'vm',
			params: {
				image: null,
				jobId: null
			}
		})
		.state('about', {
			url: '/about',
			templateUrl: 'views/about/about.html'
		})
		.state('info', {
			url: '/info',
			templateUrl: 'views/info/info.html'
		})
		.state('404', {
			templateUrl: 'views/404/404.html'
		})
	;

	$urlRouterProvider.otherwise('/');
}