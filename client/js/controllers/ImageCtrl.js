'use strict';

angular.module('phoenixeye')
.controller('ImageCtrl', [
	'$scope',
	'$http',
	'ngToast',
	'$state',
	'$stateParams',
	'$timeout',
	'PollSvc',
	function ImageCtrl($scope, $http, ngToast, $state, $stateParams, $timeout, PollSvc) {
		console.log('stateParams', $stateParams);

		$scope.image = $stateParams.image;

		if( $stateParams.jobId ) {
			PollSvc.pollUntil({
				method: 'get',
				url: 'api/jobs/' + $stateParams.jobId
			}, function (resp) {
				return resp.job.status == 'complete';
			}).promise.then(function (resp) {
				console.log('job resolved', resp);
				getAnalyses();
			});
		}

		PollSvc.pollUntil({
			method: 'get',
			url: 'api/images/' + $stateParams.permalink
		}, function (resp) {
			return resp.image.metaComplete;
		}).promise.then(function (resp) {
			console.log('image resolved', resp);
			$scope.image = resp.image;
			getAnalyses();
		});

		function getAnalyses() {
			$http({
				method: 'get',
				url: 'api/analyses/' + $scope.image._id
			}).success(function (resp, status) {
				console.log('analyses', resp);
				$scope.analyses = resp.analyses;
			}).error(function (resp, status) {
				console.log('error analyses', resp);
			});
		}
	}
]);