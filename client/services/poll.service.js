import _ from 'lodash'
import Promise from 'bluebird'
import debug from 'debug'

const log = debug('cli:services:poll')

let DI

export default class PollService {
	static $inject = [
		'$http',
		'$timeout',
		'$rootScope',
	]

	constructor() {
		DI = _.zipObject(PollService.$inject, [...arguments])
		//internal state
		_.assign(this, {
			defaultTimeout: 3000,
			pollers: []
		})
		//handle stateChange
		DI.$rootScope.$on('$stateChangeSuccess', ::this.stateChangeSuccess)
	}

	pollUntil(httpConfig, stopCondition, timeout) {
		timeout = timeout || this.defaultTimeout
		const deferred = Promise.defer()
		this.pollers.push(deferred)
		DI.$http(httpConfig)
		.then(successHandler)
		.catch(errorHandler)
		return deferred.promise

		//error from server
		function errorHandler(response) {
			deferred.reject(response)
		}

		function successHandler(response) {
			//not stopped
			if( deferred.stopped ) {
				return deferred.reject()
			}

			//stop condition not met, try again
			if( ! stopCondition(response) ) {
				DI.$timeout(function () {
					DI.$http(httpConfig)
					.then(successHandler)
					.catch(errorHandler)
				}, timeout)
			} else {
				deferred.resolve(response)
			}
		}
	}

	stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
		if( toState.name === 'image' && toParams.permalink === fromParams.permalink ) return
		this.pollers.forEach(poller => poller.stopped = true)
	}
}
