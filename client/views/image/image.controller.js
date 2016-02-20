/*global angular*/

angular.module('phoenixeye')
.controller('ImageController', ImageController);

ImageController.$inject = [
	'debug',
	'$scope',
	'$http',
	'$timeout',
	'$state',
	'$modal',
	'ngToast',
	'localStorageService',
	'cfpLoadingBar',
	'ImageService',
	'PollService',
	'GPSService'
];

function ImageController(debug, $scope, $http, $timeout, $state, $modal, ngToast, localStorageService, cfpLoadingBar, ImageService, PollService, GPSService) {
	debug = debug('app:ImageController');

	debug('state.params', $state.params);

	var vm = this;

	vm.image = $state.params.image;
	vm.displayedImage = $state.params.image;
	vm.displayFitToWidth = true;

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

	vm.collapsedPanels = localStorageService.get('collapsedPanels') || {};

	vm.requestAnalysis = requestAnalysis;
	vm.stopLoadingBar = stopLoadingBar;

	$scope.$watch('vm.collapsedPanels', collapsedPanelsWatch, true);
	$scope.$watch('vm.displayedImage', startLoadingBar);
	$scope.$watch('vm.displayedHSV', startLoadingBar);
	$scope.$watch('vm.displayedLab', startLoadingBar);

	initialize();

	function initialize () {
		//poll for jobId if its a fresh submission
		if( $state.params.jobId ) {
			pollJob($state.params.jobId);
		}

		//poll until image metadata gathering is complete
		PollService.pollUntil({
			method: 'get',
			url: 'api/images/' + $state.params.permalink
		}, function (response) {
			return response.data.image.metaComplete;
		})
		.then(function (response) {
			debug('image poll resolved', response);

			vm.image = response.data.image;
			vm.displayedImage = vm.image;

			vm.metaList = {};

			if( vm.image.exif ) {
				vm.metaList.exif = vm.image.exif;

				if( vm.image.exif.GPSInfo ) {
					vm.gps = GPSService.getCoords(vm.image.exif.GPSInfo);
				}
			}

			if( vm.image.iptc ) {
				vm.metaList.iptc = vm.image.iptc;
			}

			if( vm.image.xmp ) {
				vm.metaList.xmp = vm.image.xmp;
			}

			getAnalyses(vm.image.id);
		})
		.catch(function (err) {
			debug('error while polling api/images/imageId', err);

			var errString;

			if( err.status === 404 ) {
				errString = 'This image does not exist.';
			} else {
				errString = 'Something went wrong :(<br><strong>' + err.statusText + '</strong>';
			}

			ngToast.danger(errString);
			$state.go('404');
		});
	}

	function pollJob (jobId) {
		vm.analysisPollActive = true;

		return PollService.pollUntil({
			method: 'get',
			url: 'api/jobs/' + jobId
		}, function (response) {
			return response.data.job.status == 'complete';
		})
		.then(function (response) {
			debug('job poll resolved', response);

			vm.analysisPollActive = false;
			ngToast.success('Analyses are ready!');

			return getAnalyses(vm.image.id);
		});
	}

	function getAnalyses (imageId) {
		return ImageService.getAnalyses(imageId)
		.spread(function (analyses, histograms) {
			debug('analyses', analyses, histograms);

			vm.analyses = analyses;
			vm.histograms = histograms;

			vm.displayedHSV = histograms.hsv[0];
			vm.displayedLab = histograms.lab_fast[0];

			//get qtables for jpg after analysis complete
			if( vm.image.type == 'jpg' && Object.keys(vm.image.qtables).length === 0 ) {
				$http({
					method: 'get',
					url: 'api/images/' + $state.params.permalink
				})
				.then(function (response) {
					vm.image = response.data.image;
				});
			}
		})
		.catch(function (response, status) {
			debug('error analyses', response, status);

			ngToast.danger('Something went wrong :(<br><strong>' + response.data.error + '</strong>');
		});
	}

	function requestAnalysis () {
		var modal = $modal.open({
			animation: true,
			templateUrl: 'components/requestAnalysis/requestAnalysis.html',
			controller: 'RequestAnalysisController',
			controllerAs: 'vm',
			backdrop: 'static'
		});

		modal.result
		.then(function (response) {
			debug('modal response', response);
			ngToast.success('Analysis request submitted.');

			pollJob(response.data.jobId);
		})
		.catch(function (err) {
			debug('modal fail', err);
		});
	}

	function collapsedPanelsWatch (collapsedPanels) {
		if( ! collapsedPanels ) {
			return;
		}

		if( ! collapsedPanels.map ) {
			$timeout(function () {
				$scope.$broadcast('gpsMapInit');
			}, 1500);
		}

		localStorageService.set('collapsedPanels', collapsedPanels);
	}
	
	function startLoadingBar () {
		cfpLoadingBar.start();
	}

	function stopLoadingBar () {
		cfpLoadingBar.complete();
	}
}