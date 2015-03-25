'use strict';

angular.module('phoenixeye')
.controller('HomeCtrl', [
	'$scope',
	'$upload',
	'$http',
	'ngToast',
	'$state',
	function HomeCtrl($scope, $upload, $http, ngToast, $state) {
		this.upload = function(file) {
			if( file && file.length ) {
				$upload.upload({
					url: '/api/images/upload',
					file: file
				}).progress(function (event) {
					console.log('progress', event);
				}).success(function (data, status) {
					console.log('success', data, status);
					var jobId = data.jobId || null;
					$state.go('image', {
						image: data.image,
						jobId: jobId,
						permalink: data.image.permalink
					});
				}).error(function (data, status) {
					console.log('error', data, status);
				});
			}
		};

		this.submit = function(url) {
			$http({
				method: 'POST',
				url: 'api/images/submit',
				data: {url: url}
			}).success(function (data, status) {
				console.log('success', data, status);
			}).error(function (data, status) {
				console.log('error', data, status);
			});
		};
	}
]);