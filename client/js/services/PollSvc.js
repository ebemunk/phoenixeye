'use strict';

angular.module('phoenixeye')
.service('PollSvc', [
	'$q',
	'$http',
	'$timeout',
	'$rootScope',
	function PollSvc($q, $http, $timeout, $rootScope) {
		var defaultTimeout = 3000;

		//list of promises for polls
		var pollers = [];

		//stop all pollers on state change
		$rootScope.$on('$stateChangeSuccess', function () {
			pollers.forEach(function (poller) {
				poller.stopped = true;
			});
		});

		return {
			pollUntil: function(httpConfig, stopCondition, timeout) {
				timeout = timeout || defaultTimeout;

				var deferred = $q.defer();
				pollers.push(deferred);

				//error from server
				function errorHandler(resp, status) {
					deferred.reject(resp);
				}

				function successHandler(resp, status) {
					//not stopped
					if( deferred.stopped ) {
						return deferred.reject();
					}

					//stop condition not met, try again
					if( ! stopCondition(resp) ) {
						$timeout(function () {
							$http(httpConfig)
								.success(successHandler)
								.error(errorHandler)
							;
						}, timeout);
					} else {
						deferred.resolve(resp);
					}
				}

				$http(httpConfig)
					.success(successHandler)
					.error(errorHandler)
				;

				return deferred;
			}
		}
	}
]);