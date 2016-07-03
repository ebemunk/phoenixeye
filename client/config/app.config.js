AppConfig.$inject = [
	'$locationProvider',
	'$urlRouterProvider',
	'localStorageServiceProvider',
]

export function AppConfig($locationProvider, $urlRouterProvider, localStorageServiceProvider) {
	if( process.env.NODE_ENV === 'production' ) {
		$locationProvider.html5Mode(true)
	}
	$urlRouterProvider.otherwise('/')
	localStorageServiceProvider.setPrefix('phoenixeye')
}
