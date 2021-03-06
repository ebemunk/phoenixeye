/*global angular, Promise, debug, $, noUiSlider, Fuse, THREE, katex, Rollbar*/

//3rd party dependencies
angular.module('phoenixeye-deps', [
	'LocalStorageModule',
	'ui.router',
	'ui.bootstrap',
	'ui.scrollpoint',
	'ngFileUpload',
	'ngToast',
	'ngMap',
	'angular-loading-bar',
	'cfp.loadingBar',
	'angular.filter',
	'duScroll',
	'ngOnload',
	'720kb.socialshare'
]);

//module
var module = angular.module('phoenixeye', [
	'phoenixeye-deps',
	'templates'
]);

//constants
module
.constant('Promise', Promise)
.constant('debug', debug)
.constant('$', $)
.constant('noUiSlider', noUiSlider)
.constant('Fuse', Fuse)
.constant('THREE', THREE)
.constant('katex', katex)
.constant('Rollbar', Rollbar)
;

module.run(appRun);

appRun.$inject = [
	'debug',
	'$document',
	'$window',
	'$rootScope',
	'$location'
];

function appRun (debug, $document, $window, $rootScope, $location) {
	debug = debug('app:run');

	$rootScope.$on('$viewContentLoaded', function () {
		$document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
	});

	$rootScope.$on('$stateChangeSuccess', function () {
		if( ! $window.ga ) {
			return;
		}

		$window.ga('send', 'pageview', { page: $location.path() });
	});
}