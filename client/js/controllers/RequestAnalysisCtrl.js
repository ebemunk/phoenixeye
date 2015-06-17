'use strict';

angular.module('phoenixeye')
.controller('RequestAnalysisCtrl', [
	'$scope',
	'$modalInstance',
	'$http',
	'$stateParams',
	function RequestAnalysisCtrl($scope, $modalInstance, $http, $stateParams) {
		console.log('YUP!');

		$scope.analysis = {};
		$scope.ela = {
			quality: 70
		};
		$scope.copymove = {};

		$scope.ok = function () {
			if( $scope.analysis.ela && $scope.ela.quality ) {
				$scope.analysis.ela = {
					quality: $scope.elaQuality
				};
			}

			if( $scope.analysis.copymove && ($scope.copymove.retain || $scope.copymove.qcoeff) ) {
				$scope.analysis.copymove = {};

				if( $scope.copymove.retain )
					$scope.analysis.copymove.retain = $scope.copymove.retain;

				if( $scope.copymove.qcoeff )
					$scope.analysis.coppymove.qcoeff = $scope.copymove.qcoeff;
			}

			var requestPromise = $http({
				method: 'post',
				url: 'api/images/' + $stateParams.permalink + '/analysis',
				data: $scope.analysis
			});

			$modalInstance.close(requestPromise);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}
]);