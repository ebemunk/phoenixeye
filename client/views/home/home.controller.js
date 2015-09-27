/*global angular*/

angular.module('phoenixeye')
.controller('HomeController', HomeController);

HomeController.$inject = [
	'debug',
	'$http',
	'$q',
	'$rootScope',
	'$state',
	'Upload',
	'ngToast',
	'localStorageService',
	'$modal'
];

function HomeController (debug, $http, $q, $rootScope, $state, Upload, ngToast, localStorageService, $modal) {
	debug = debug('app:HomeController');

	var vm = this;

	vm.upload = upload;
	vm.submit = submit;

	function upload (file) {
		if( file && file.length ) {
			acceptedSubmissionPolicy()
			.then(function () {
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
			})
			.catch(mustAcceptSubmissionPolicy);
		}
	}

	function submit (url) {
		acceptedSubmissionPolicy()
		.then(function () {
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
		})
		.catch(mustAcceptSubmissionPolicy);
	}

	function acceptedSubmissionPolicy () {
		var accepted = $q.defer();

		if( localStorageService.get('acceptedSubmissionPolicy') ) {
			accepted.resolve(true);
		} else {
			var modalScope = $rootScope.$new();
			modalScope.ok = function () {
				modal.close(true);
			};

			var modal = $modal.open({
				animation: true,
				templateUrl: 'components/imagePolicy/imagePolicy.html',
				scope: modalScope,
				backdrop: 'static',
				keyboard: false
			});

			modal.result
			.then(function (response) {
				debug('modal response', response);

				localStorageService.set('acceptedSubmissionPolicy', response);

				if( ! response ) {
					accepted.reject();
					return;
				}

				accepted.resolve(true);
			})
			.catch(function (err) {
				debug('modal fail', err);
				accepted.reject();
			});
		}

		return accepted.promise;
	}

	function mustAcceptSubmissionPolicy () {
		ngToast.danger('You must accept the upload policy to submit images for analysis.');
	}
}