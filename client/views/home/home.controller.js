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
			.success(function (data, status) {
				debug('success', data, status);

				var jobId = data.jobId || null;

				ngToast.success('Upload complete!');

				$state.go('image', {
					image: data.image,
					jobId: jobId,
					permalink: data.image.permalink
				});
			})
			.error(function (data, status) {
				debug('error', data, status);

				ngToast.danger('Something went wrong. (' + data.error + ')');
			});
		}
	}

	function submit (url) {
		$http({
			method: 'POST',
			url: 'api/images/submit',
			data: {url: url}
		})
		.then(function (resp, status) {
			debug('success', resp, status);

			var jobId = resp.data.jobId || null;

			$state.go('image', {
				image: resp.data.image,
				jobId: jobId,
				permalink: resp.data.image.permalink
			});
		})
		.catch(function (data, status) {
			debug('error', data, status);
		});
	}
}