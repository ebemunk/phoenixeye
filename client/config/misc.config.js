/*global angular*/

angular.module('phoenixeye').config(MiscConfig);

MiscConfig.$inject = [
	'localStorageServiceProvider'
];

function MiscConfig (localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('phoenixeye');
}