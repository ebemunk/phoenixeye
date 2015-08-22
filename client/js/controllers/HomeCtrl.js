(function () {

'use strict';

var dbg = debug('app:HomeCtrl');

angular.module('phoenixeye')
.controller('HomeCtrl', [
	'$scope',
	'Upload',
	'$http',
	'ngToast',
	'$state',
	function HomeCtrl($scope, Upload, $http, ngToast, $state) {
		$scope.upload = function(file) {
			if( file && file.length ) {
				Upload.upload({
					url: '/api/images/upload',
					file: file
				})
				.progress(function (event) {
					dbg('progress', event);
				})
				.success(function (data, status) {
					dbg('success', data, status);
					var jobId = data.jobId || null;
					$state.go('image', {
						image: data.image,
						jobId: jobId,
						permalink: data.image.permalink
					});
				})
				.error(function (data, status) {
					dbg('error', data, status);
				});
			}
		};

		$scope.submit = function(url) {
			$http({
				method: 'POST',
				url: 'api/images/submit',
				data: {url: url}
			})
			.then(function (resp, status) {
				dbg('success', resp, status);
				var jobId = resp.data.jobId || null;
				$state.go('image', {
					image: resp.data.image,
					jobId: jobId,
					permalink: resp.data.image.permalink
				});
			})
			.catch(function (data, status) {
				dbg('error', data, status);
			});
		};
	}
]);

})();