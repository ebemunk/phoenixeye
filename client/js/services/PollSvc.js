'use strict';

angular.module('phoenixeye')
.service('PollSvc', [
	'$q',
	'$http',
	'$timeout',
	function PollSvc($q, $http, $timeout) {
		var defaultTimeout = 3000;

		return {
			pollUntil: function(httpConfig, stopCondition, timeout) {
				timeout = timeout || defaultTimeout;

				var deferred = $q.defer();

				function errorHandler(resp, status) {
					deferred.reject(resp);
				}

				function successHandler(resp, status) {
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