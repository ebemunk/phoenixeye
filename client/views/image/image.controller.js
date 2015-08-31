angular.module('phoenixeye')
.controller('ImageController', ImageController);

ImageController.$inject = [
	'$scope',
	'$http',
	'$state',
	'$modal',
	'ngToast',
	'debug',
	'ImageService',
	'PollService'
];

ImageController.$name = 'ImageController';

function ImageController() {
	injectToThis(this.constructor).apply(this, arguments);

	var vm = this;

	vm.image = vm.$state.params.image;
	vm.displayedImage = vm.$state.params.image;

	vm.analyses = {
		ela: [],
		lg: [],
		avgdist: [],
		copymove: []
	};

	vm.histograms = {
		hsv: [],
		lab_fast: []
	};

	vm.displayedHSV = null;
	vm.displayedLab = null;

	vm.collapsedPanels = {};

	vm.debug('state.params', vm.$state.params);

	// //poll for jobId if its a fresh submission
	// if( $stateParams.jobId ) {
	// 	pollForJob($stateParams.jobId);
	// }

	//poll until image metadata gathering is complete
	vm.PollService.pollUntil({
		method: 'get',
		url: 'api/images/' + vm.$state.params.permalink
	}, function (response) {
		return response.data.image.metaComplete;
	}).promise
	.then(function (response) {
		vm.debug('image poll resolved', response);
		vm.image = response.data.image;
		vm.displayedImage = vm.image;
		vm.getAnalyses(vm.image.id);
	});

	// $scope.$watch('image', function (newV) {
	// 	if( ! newV ) return;

	// 	$scope.metaList = {};

	// 	if( newV.xmp ) {
	// 		$scope.metaList.xmp = newV.xmp;
	// 	}

	// 	if( newV.exif ) {
	// 		$scope.metaList.exif = newV.exif;
	// 	}

	// 	if( newV.iptc ) {
	// 		$scope.metaList.iptc = newV.iptc;
	// 	}

	// 	if( newV.exif && newV.exif.GPSInfo ) {
	// 		$scope.gps = {
	// 			lat: gpsDMStoDD(newV.exif.GPSInfo.GPSLatitude, newV.exif.GPSInfo.GPSLatitudeRef),
	// 			lng: gpsDMStoDD(newV.exif.GPSInfo.GPSLongitude, newV.exif.GPSInfo.GPSLongitudeRef)
	// 		};
	// 	}
	// });

	// //switch displayed image
	// $scope.displayImage = function(image) {
	// 	$scope.displayedImage = image;
	// };

	// function gpsDMStoDD(gpsString, gpsDirection) {
	// 	var parts = gpsString.split(' ');

	// 	var deg = parseFloat(parts[0].replace('deg', '').replace('°', '')) || 0;
	// 	var min = parseFloat(parts[1]) || 0;
	// 	var sec = parseFloat(parts[2]) || 0;
	// 	gpsDirection = gpsDirection || parts[3];

	// 	dbg('gps deg,min,sec,direction', deg, min, sec, gpsDirection);

	// 	var dd = deg + min/60 + sec/3600;

	// 	if( gpsDirection ) {
	// 		gpsDirection = gpsDirection[0].toLowerCase();
	// 		if( gpsDirection == 's' || gpsDirection == 'w' ) {
	// 			dd *= -1;
	// 		}
	// 	}

	// 	dbg('gps dd', dd);

	// 	return dd;
	// }

	// $scope.requestAnalysis = function() {
	// 	var modal = $modal.open({
	// 		animation: true,
	// 		templateUrl: 'html/partials/requestAnalysis.html',
	// 		controller: 'RequestAnalysisCtrl'
	// 	});

	// 	modal.result.then(function (resp) {
	// 		dbg('requestAnalysis response', resp);

	// 		pollForJob(resp.data.jobId);
	// 	}).catch(function (err) {
	// 		dbg('requestAnalysis fail', err);
	// 	});
	// };
}

ImageController.prototype.pollJob = function (jobId) {
	var vm = this;

	return vm.PollService.pollUntil({
		method: 'get',
		url: 'api/jobs/' + jobId
	}, function (resp) {
		return resp.job.status == 'complete';
	}).promise
	.then(function (resp) {
		vm.debug('job poll resolved', resp);

		return vm.getAnalyses();
	});
};

ImageController.prototype.getAnalyses = function (imageId) {
	var vm = this;

	return vm.ImageService.getAnalyses(imageId)
	.spread(function (analyses, histograms) {
		vm.debug('analyses', analyses, histograms);

		vm.analyses = analyses;
		vm.histograms = histograms;

		if( ! vm.displayedHSV ) {
			vm.displayedHSV = histograms.hsv[0];
		}

		if( ! vm.displayedLab ) {
			vm.displayedLab = histograms.lab_fast[0];
		}

		// //get qtables for jpg after analysis complete
		// if( $scope.image.type == 'jpg' && Object.keys($scope.image.qtables).length == 0 ) {
		// 	$http({
		// 		method: 'get',
		// 		url: 'api/images/' + $stateParams.permalink
		// 	})
		// 	.then(function (resp) {
		// 		$scope.image = resp.data.image;
		// 	});
		// }
	})
	.catch(function (response, status) {
		vm.debug('error analyses', response, status);
	});
};