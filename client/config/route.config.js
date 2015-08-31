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
	;

	$urlRouterProvider.otherwise('/');
}