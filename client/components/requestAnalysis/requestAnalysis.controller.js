/*global angular, injectToThis*/

angular.module('phoenixeye')
.controller('RequestAnalysisController', RequestAnalysisController);

RequestAnalysisController.$inject = [
	'$modalInstance',
	'$http',
	'$state',
	'debug'
];

RequestAnalysisController.$name = 'RequestAnalysisController';

function RequestAnalysisController () {
	injectToThis(this.constructor).apply(this, arguments);

	var vm = this;

	vm.analysis = {};
	vm.ela = {
		quality: 70
	};
	vm.copymove = {
		retain: 4,
		qcoeff: 1
	};
	vm.hsv = {
		whitebg: false
	};
	vm.labfast = {
		whitebg: false
	};
}

RequestAnalysisController.prototype.ok = function () {
	var vm = this;

	if( vm.analysis.ela && vm.elaQuality ) {
		vm.analysis.ela = {
			quality: vm.elaQuality
		};
	}

	if( vm.analysis.copymove && (vm.copymove.retain || vm.copymove.qcoeff) ) {
		vm.analysis.copymove = {};

		if( vm.copymoveRetain ) {
			vm.analysis.copymove.retain = vm.copymoveRetain;
		}

		if( vm.copymoveQcoeff ) {
			vm.analysis.copymove.qcoeff = vm.copymoveQcoeff;
		}
	}

	if( vm.hsvWhitebg ) {
		vm.analysis.hsv = {
			whitebg: true
		};
	}

	if( vm.labfastWhitebg ) {
		vm.analysis.labfast = {
			whitebg: true
		};
	}

	if( ! vm.isRequestEmpty() ) {
		var requestPromise = vm.$http({
			method: 'post',
			url: 'api/images/' + vm.$state.params.permalink + '/analysis',
			data: vm.analysis
		});

		vm.$modalInstance.close(requestPromise);
	}
};

RequestAnalysisController.prototype.cancel = function () {
	var vm = this;

	vm.$modalInstance.dismiss('cancel');
};

RequestAnalysisController.prototype.isRequestEmpty = function () {
	var vm = this;

	var atLeastOne = Object.keys(vm.analysis).some(function (key) {
		return vm.analysis[key];
	});

	return ! atLeastOne;
};