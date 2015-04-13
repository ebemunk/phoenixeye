'use strict';

angular.module('phoenixeye')
.controller('ImageCtrl', [
	'$scope',
	'$http',
	'ngToast',
	'$stateParams',
	'$timeout',
	'PollSvc',
	function ImageCtrl($scope, $http, ngToast, $stateParams, $timeout, PollSvc) {
		console.log('stateParams', $stateParams);

		$scope.image = $stateParams.image;
		$scope.displayedImage = $stateParams.image;
		$scope.displayedHSV = null;
		$scope.displayedLab = null;

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

		$scope.collapsedPanels = {};

		//poll for jobId if its a fresh submission
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

		//poll until image metadata gathering is complete
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

		$scope.$watch('image', function (newV) {
			if( ! newV ) return;

			$scope.metaList = {};
			if( newV.xmp ) {
				$scope.metaList.xmp = newV.xmp;
			}

			if( newV.exif ) {
				$scope.metaList.exif = newV.exif;
			}

			if( newV.iptc ) {
				$scope.metaList.iptc = newV.iptc;
			}

			}
		});
		//get analyses and separate them by type between histograms/analyses
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

				//sort by most recent created date
				for( var type in $scope.analyses ) {
					$scope.analyses[type] = $scope.analyses[type].sort(function (a, b) {
						return a.created < b.created;
					});
				}

				//sort by most recent created date
				for( var type in $scope.histograms ) {
					$scope.histograms[type] = $scope.histograms[type].sort(function (a, b) {
						return a.created < b.created;
					});
				}

				$scope.displayedHSV = $scope.histograms.hsv[0];
				$scope.displayedLab = $scope.histograms.lab_fast[0];

				//get qtables for jpg after analysis complete
				if( $scope.image.type == 'jpg' && Object.keys($scope.image.qtables).length == 0 ) {
					$http({
						method: 'get',
						url: 'api/images/' + $stateParams.permalink
					}).then(function (resp) {
						$scope.image = resp.data.image;
					});
				}
			}).error(function (resp, status) {
				console.log('error analyses', resp);
			});
		}

		//switch displayed image
		$scope.displayImage = function(image) {
			$scope.displayedImage = image;
		};
	}
]);