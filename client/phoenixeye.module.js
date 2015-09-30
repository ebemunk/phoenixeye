/*global angular, Promise, debug, $, noUiSlider, Fuse, THREE katex*/

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
	'angular.filter'
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
;

module.run(appRun);

appRun.$inject = [
	'$document',
	'$rootScope',
	'$state'
];

function appRun ($document, $rootScope, $state) {
	$rootScope.$on('$viewContentLoaded', function () {
		$document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
	});

	$rootScope.$state = {
		is: $state.is
	};
}