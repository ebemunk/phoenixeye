/*global angular*/

angular.module('phoenixeye')
.controller('HomeController', HomeController);

HomeController.$inject = [
	'debug',
	'$http',
	'$state',
	'Upload',
	'ngToast'
];

function HomeController (debug, $http, $state, Upload, ngToast) {
	debug = debug('app:HomeController');

	var vm = this;

	vm.upload = upload;
	vm.submit = submit;

	function upload (file) {
		if( file && file.length ) {
			Upload.upload({
				url: '/api/images/upload',
				file: file
			})
			.progress(function (event) {
				debug('progress', event);
			})
			.success(function (response, status) {
				debug('success', response, status);

				var jobId = response.jobId || null;

				ngToast.success('Upload complete!');

				$state.go('image', {
					image: response.image,
					jobId: jobId,
					permalink: response.image.permalink
				});
			})
			.catch(function (response) {
				debug('error', response);
				ngToast.danger('Something went wrong :(<br><strong>' + response.data.error + '</strong>');
			});
		}
	}

	function submit (url) {
		$http({
			method: 'POST',
			url: 'api/images/submit',
			data: {url: url}
		})
		.then(function (response, status) {
			debug('success', response, status);

			var jobId = response.data.jobId || null;

			$state.go('image', {
				image: response.data.image,
				jobId: jobId,
				permalink: response.data.image.permalink
			});
		})
		.catch(function (response, status) {
			debug('error', response, status);
			ngToast.danger('Something went wrong :(<br><strong>' + response.data.error + '</strong>');
		});
	}
}