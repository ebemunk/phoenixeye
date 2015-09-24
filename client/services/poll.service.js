/*global angular*/

angular.module('phoenixeye')
.service('PollService', PollService);

PollService.$inject = [
	'debug',
	'$q',
	'$http',
	'$timeout',
	'$rootScope'
];

function PollService (debug, $q, $http, $timeout, $rootScope) {
	debug = debug('app:PollService');

	var defaultTimeout = 3000;
	var self = this;

	this.pollers = [];
	this.pollUntil = pollUntil;

	$rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

	//stop all pollers on state change
	function stateChangeSuccess (event, toState) {
		if( toState.name === 'image' ) {
			return;
		}

		self.pollers.forEach(function (poller) {
			poller.stopped = true;
		});
	}

	function pollUntil (httpConfig, stopCondition, timeout) {
		timeout = timeout || defaultTimeout;

		var deferred = $q.defer();
		self.pollers.push(deferred);

		//error from server
		function errorHandler(response) {
			deferred.reject(response);
		}

		function successHandler(response) {
			//not stopped
			if( deferred.stopped ) {
				return deferred.reject();
			}

			//stop condition not met, try again
			if( ! stopCondition(response) ) {
				$timeout(function () {
					$http(httpConfig)
					.then(successHandler)
					.catch(errorHandler);
				}, timeout);
			} else {
				deferred.resolve(response);
			}
		}

		$http(httpConfig)
		.then(successHandler)
		.catch(errorHandler);

		return deferred.promise;
	}
}