/*global angular*/

var module = angular.module('phoenixeye');
module.config(PromiseConfig);
module.run(PromiseScheduler);

PromiseConfig.$inject = [
	'$qProvider',
	'Promise'
];

function PromiseConfig ($qProvider, Promise) {
	$qProvider.$get = function () {
		function QBird(resolver) {
			return new Promise(resolver);
		}

		QBird.defer = function () {
			var deferred = {};
			deferred.promise = new Promise(function (resolve, reject) {
				deferred.resolve = resolve;
				deferred.reject = reject;
			});
			return deferred;
		};

		QBird.reject = Promise.reject;
		QBird.when = Promise.resolve;
		QBird.all = Promise.all;

		return QBird;
	};
}

PromiseScheduler.$inject = [
	'debug',
	'$rootScope',
	'Promise',
	'Rollbar'
];

function PromiseScheduler (debug, $rootScope, Promise, Rollbar) {
	debug = debug('app:PromiseScheduler');

	Promise.setScheduler(function (callback) {
		$rootScope.$evalAsync(callback);
	});

	Promise.onPossiblyUnhandledRejection(function (error, promise) {
		if( error.message && error.message.match(/(superseded|prevented|aborted|failed|canceled)/) ) {
			return;
		}

		if( promise ) {
			promise
			.catch(function (err) {
				if( err.status === 415 || err.status === 413 ) {
					return;
				}

				debug(err, error.stack);
			});
		} else {
			debug(error.stack);
			Rollbar.error('uncaught promise rejection', error);
		}
	});
}
