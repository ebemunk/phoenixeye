//3rd party dependencies
angular.module('phoenixeye-deps', [
	'ui.router',
	'ui.bootstrap',
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
;