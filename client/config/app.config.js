AppConfig.$inject = [
	'$locationProvider',
	'$urlRouterProvider'
]

export function AppConfig($locationProvider, $urlRouterProvider) {
	$locationProvider.html5Mode(true)
	$urlRouterProvider.otherwise('/')
}
