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
		$scope.displayedImage = $stateParams.image;

		$scope.analyses = {
			ela: [],
			lg: [],
			avgdist: [],
			copymove: []
		};

		$scope.histograms = {
			hsv: [],
			lab_fast: []
		};

		if( $stateParams.jobId ) {
			PollSvc.pollUntil({
				method: 'get',
				url: 'api/jobs/' + $stateParams.jobId
			}, function (resp) {
				return resp.job.status == 'complete';
			}).promise.then(function (resp) {
				console.log('job poll resolved', resp);
				getAnalyses();
			});
		}

		PollSvc.pollUntil({
			method: 'get',
			url: 'api/images/' + $stateParams.permalink
		}, function (resp) {
			return resp.image.metaComplete;
		}).promise.then(function (resp) {
			console.log('image poll resolved', resp);
			$scope.image = resp.image;
			$scope.displayedImage = resp.image;
			getAnalyses();
		});

		function getAnalyses() {
			$http({
				method: 'get',
				url: 'api/analyses/' + $scope.image._id
			}).success(function (resp, status) {
				console.log('analyses', resp);
				resp.analyses.forEach(function (analysis) {
					if( analysis.type == 'hsv' || analysis.type == 'lab_fast' ) {
						$scope.histograms[analysis.type].push(analysis);
					} else {
						$scope.analyses[analysis.type].push(analysis);
					}
				});
			}).error(function (resp, status) {
				console.log('error analyses', resp);
			});
		}

		$scope.displayImage = function(image) {
			$scope.displayedImage = image;
		};
	}
]);