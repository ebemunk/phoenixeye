(function () {

'use strict';

var dbg = debug('app:ImageCtrl');

angular.module('phoenixeye')
.controller('ImageCtrl', [
	'$scope',
	'$http',
	'ngToast',
	'$stateParams',
	'$timeout',
	'PollSvc',
	'$modal',
	function ImageCtrl($scope, $http, ngToast, $stateParams, $timeout, PollSvc, $modal) {
		dbg('stateParams', $stateParams);

		$scope.image = $stateParams.image;
		$scope.displayedImage = $stateParams.image;
		$scope.displayedHSV = null;
		$scope.displayedLab = null;

		$scope.collapsedPanels = {};

		//poll for jobId if its a fresh submission
		if( $stateParams.jobId ) {
			pollForJob($stateParams.jobId);
		}

		//poll until image metadata gathering is complete
		PollSvc.pollUntil({
			method: 'get',
			url: 'api/images/' + $stateParams.permalink
		}, function (resp) {
			return resp.image.metaComplete;
		}).promise
		.then(function (resp) {
			dbg('image poll resolved', resp);
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

			if( newV.exif && newV.exif.GPSInfo ) {
				$scope.gps = {
					lat: gpsDMStoDD(newV.exif.GPSInfo.GPSLatitude, newV.exif.GPSInfo.GPSLatitudeRef),
					lng: gpsDMStoDD(newV.exif.GPSInfo.GPSLongitude, newV.exif.GPSInfo.GPSLongitudeRef)
				};
			}
		});

		//get analyses and separate them by type between histograms/analyses
		function getAnalyses() {
			dbg('get analysis start', $scope.image);

			//reset objects
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

			$http({
				method: 'get',
				url: 'api/analyses/' + $scope.image.id
			})
			.then(function (resp, status) {
				dbg('analyses', resp);
				resp.data.forEach(function (analysis) {
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
					})
					.then(function (resp) {
						$scope.image = resp.data.image;
					});
				}
			})
			.catch(function (resp, status) {
				dbg('error analyses', resp);
			});
		}

		function pollForJob(jobId) {
			PollSvc.pollUntil({
				method: 'get',
				url: 'api/jobs/' + jobId
			}, function (resp) {
				return resp.job.status == 'complete';
			}).promise.then(function (resp) {
				dbg('job poll resolved', resp);
				getAnalyses();
			});
		}

		//switch displayed image
		$scope.displayImage = function(image) {
			$scope.displayedImage = image;
		};

		function gpsDMStoDD(gpsString, gpsDirection) {
			var parts = gpsString.split(' ');

			var deg = parseFloat(parts[0].replace('deg', '').replace('°', '')) || 0;
			var min = parseFloat(parts[1]) || 0;
			var sec = parseFloat(parts[2]) || 0;
			gpsDirection = gpsDirection || parts[3];

			dbg('gps deg,min,sec,direction', deg, min, sec, gpsDirection);

			var dd = deg + min/60 + sec/3600;

			if( gpsDirection ) {
				gpsDirection = gpsDirection[0].toLowerCase();
				if( gpsDirection == 's' || gpsDirection == 'w' ) {
					dd *= -1;
				}
			}

			dbg('gps dd', dd);

			return dd;
		}

		$scope.requestAnalysis = function() {
			var modal = $modal.open({
				animation: true,
				templateUrl: 'html/partials/requestAnalysis.html',
				controller: 'RequestAnalysisCtrl'
			});

			modal.result.then(function (resp) {
				dbg('requestAnalysis response', resp);

				pollForJob(resp.data.jobId);
			}).catch(function (err) {
				dbg('requestAnalysis fail', err);
			});
		};
	}
]);

})();