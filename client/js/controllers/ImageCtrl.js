'use strict';

angular.module('phoenixeye')
.controller('ImageCtrl', [
	'$scope',
	'$http',
	'ngToast',
	'$state',
	'$stateParams',
	function ImageCtrl($scope, $http, ngToast, $state, $stateParams) {
		this.par = $stateParams;
		console.log($stateParams);
	}
]);