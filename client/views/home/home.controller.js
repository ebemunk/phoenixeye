/*global angular, injectToThis*/

angular.module('phoenixeye')
.controller('HomeController', HomeController);

HomeController.$inject = [
	'$http',
	'$state',
	'Upload',
	'ngToast',
	'debug'
];

HomeController.$name = 'HomeController';

function HomeController () {
	injectToThis(this.constructor).apply(this, arguments);
}

HomeController.prototype.upload = function (file) {
	var vm = this;

	if( file && file.length ) {
		vm.Upload.upload({
			url: '/api/images/upload',
			file: file
		})
		.progress(function (event) {
			vm.debug('progress', event);
		})
		.success(function (data, status) {
			vm.debug('success', data, status);
			var jobId = data.jobId || null;
			vm.$state.go('image', {
				image: data.image,
				jobId: jobId,
				permalink: data.image.permalink
			});
		})
		.error(function (data, status) {
			vm.debug('error', data, status);
		});
	}
};

HomeController.prototype.submit = function (url) {
	var vm = this;

	vm.$http({
		method: 'POST',
		url: 'api/images/submit',
		data: {url: url}
	})
	.then(function (resp, status) {
		vm.debug('success', resp, status);
		var jobId = resp.data.jobId || null;
		vm.$state.go('image', {
			image: resp.data.image,
			jobId: jobId,
			permalink: resp.data.image.permalink
		});
	})
	.catch(function (data, status) {
		vm.debug('error', data, status);
	});
};