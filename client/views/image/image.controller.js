/*global angular, injectToThis*/

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
	'PollService',
	'GPSService'
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

	//poll for jobId if its a fresh submission
	if( vm.$state.params.jobId ) {
		vm.pollJob(vm.$state.params.jobId);
	}

	//poll until image metadata gathering is complete
	vm.PollService.pollUntil({
		method: 'get',
		url: 'api/images/' + vm.$state.params.permalink
	}, function (response) {
		return response.data.image.metaComplete;
	})
	.then(function (response) {
		vm.debug('image poll resolved', response);
		vm.image = response.data.image;
		vm.displayedImage = vm.image;

		vm.metaList = {};

		if( vm.image.exif ) {
			vm.metaList.exif = vm.image.exif;

			if( vm.image.exif.GPSInfo ) {
				vm.gps = vm.GPSService.getCoords(vm.image.exif.GPSInfo);
			}
		}

		if( vm.image.iptc ) {
			vm.metaList.iptc = vm.image.iptc;
		}

		if( vm.image.xmp ) {
			vm.metaList.xmp = vm.image.xmp;
		}

		vm.getAnalyses(vm.image.id);
	})
	.catch(function (err) {
		vm.debug('error while polling api/images/imageId', err);
		var errString;

		if( err.status === 404 ) {
			errString = 'This image does not exist.';
		} else {
			errString = 'Something went wrong. (' + err.statusText + ')';
		}

		vm.ngToast.danger(errString);
		vm.$state.go('404');
	});
}

ImageController.prototype.pollJob = function (jobId) {
	var vm = this;

	vm.analysisPollActive = true;

	return vm.PollService.pollUntil({
		method: 'get',
		url: 'api/jobs/' + jobId
	}, function (response) {
		return response.data.job.status == 'complete';
	})
	.then(function (response) {
		vm.debug('job poll resolved', response);

		vm.analysisPollActive = false;
		vm.ngToast.success('Analyses are ready!');

		return vm.getAnalyses(vm.image.id);
	});
};

ImageController.prototype.getAnalyses = function (imageId) {
	var vm = this;

	return vm.ImageService.getAnalyses(imageId)
	.spread(function (analyses, histograms) {
		vm.debug('analyses', analyses, histograms);

		vm.analyses = analyses;
		vm.histograms = histograms;

		vm.displayedHSV = histograms.hsv[0];
		vm.displayedLab = histograms.lab_fast[0];

		//get qtables for jpg after analysis complete
		if( vm.image.type == 'jpg' && Object.keys(vm.image.qtables).length === 0 ) {
			vm.$http({
				method: 'get',
				url: 'api/images/' + vm.$state.params.permalink
			})
			.then(function (response) {
				vm.image = response.data.image;
			});
		}
	})
	.catch(function (response, status) {
		vm.debug('error analyses', response, status);
	});
};

ImageController.prototype.requestAnalysis = function () {
	var vm = this;

	var modal = vm.$modal.open({
		animation: true,
		templateUrl: 'components/requestAnalysis/requestAnalysis.html',
		controller: 'RequestAnalysisController',
		controllerAs: 'vm',
		backdrop: 'static'
	});

	modal.result
	.then(function (response) {
		vm.debug('modal response', response);

		vm.pollJob(response.data.jobId);
	})
	.catch(function (err) {
		vm.debug('modal fail', err);
	});
};