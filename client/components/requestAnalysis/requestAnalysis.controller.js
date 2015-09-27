/*global angular*/

angular.module('phoenixeye')
.controller('RequestAnalysisController', RequestAnalysisController);

RequestAnalysisController.$inject = [
	'debug',
	'$http',
	'$state',
	'$modalInstance',
	'$rootScope'
];

function RequestAnalysisController (debug, $http, $state, $modalInstance, $rootScope) {
	debug = debug('app:RequestAnalysisController');

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

	vm.ok = ok;
	vm.cancel = cancel;

	$rootScope.$on('$stateChangeSuccess', cancel);

	function ok () {
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

		if( ! isRequestEmpty() ) {
			var requestPromise = $http({
				method: 'post',
				url: 'api/images/' + $state.params.permalink + '/analysis',
				data: vm.analysis
			});

			$modalInstance.close(requestPromise);
		}
	}

	function cancel () {
		$modalInstance.dismiss('cancel');
	}

	function isRequestEmpty () {
		var atLeastOne = Object.keys(vm.analysis).some(function (key) {
			return vm.analysis[key];
		});

		return ! atLeastOne;
	}
}