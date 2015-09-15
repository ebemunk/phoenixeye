/*global angular, injectToThis*/

angular.module('phoenixeye')
.service('PollService', PollService);

PollService.$inject = [
	'$q',
	'$http',
	'$timeout',
	'$rootScope',
	'debug'
];

PollService.$name = 'PollService';

function PollService () {
	injectToThis(this.constructor).apply(this, arguments);

	var self = this;

	self.defaultTimeout = 3000;
	self.pollers = [];

	self.$rootScope.$on('$stateChangeSuccess', self.stateChangeSuccess.bind(self));
}

//stop all pollers on state change
PollService.prototype.stateChangeSuccess = function (event, toState) {
	var self = this;

	if( toState.name === 'image' ) {
		return;
	}

	self.pollers.forEach(function (poller) {
		poller.stopped = true;
	});
};

PollService.prototype.pollUntil = function (httpConfig, stopCondition, timeout) {
	var self = this;

	timeout = timeout || self.defaultTimeout;

	var deferred = self.$q.defer();
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
			self.$timeout(function () {
				self.$http(httpConfig)
				.then(successHandler)
				.catch(errorHandler);
			}, timeout);
		} else {
			deferred.resolve(response);
		}
	}

	self.$http(httpConfig)
	.then(successHandler)
	.catch(errorHandler);

	return deferred.promise;
};