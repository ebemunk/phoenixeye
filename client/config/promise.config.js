import Promise from 'bluebird'

//Monkey-path $q with bluebird
PromiseConfig.$inject = ['$qProvider']

export function PromiseConfig($qProvider) {
	// $qProvider.$get = () => {
	// 	function QBird(resolver) {
	// 		return new Promise(resolver)
	// 	}
	//
	// 	QBird.defer = function() {
	// 		var deferred = {}
	// 		deferred.promise = new Promise((resolve, reject) => {
	// 			deferred.resolve = resolve
	// 			deferred.reject = reject
	// 		})
	// 		return deferred
	// 	}
	//
	// 	QBird.reject = Promise.reject
	// 	QBird.when = Promise.resolve
	// 	QBird.all = Promise.all
	//
	// 	return QBird
	// }
}

//Scheduler
PromiseScheduler.$inject = ['$rootScope']

export function PromiseScheduler($rootScope) {
	Promise.setScheduler(::$rootScope.$evalAsync)

	Promise.onPossiblyUnhandledRejection((error, promise) => {
		if( error.message && error.message.match(/(superseded|prevented|aborted|failed|canceled)/) ) {
			return
		}

		if( promise ) {
			promise
			.catch(err => {
				if( err.status === 415 || err.status === 413 ) {
					return
				}
				// debug(err, error.stack)
			})
		} else {
			// debug(error.stack)
			// Rollbar.error('uncaught promise rejection', error)
		}
	})
}
