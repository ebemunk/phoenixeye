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