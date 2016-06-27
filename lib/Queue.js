import debug from 'debug'
import Promise from 'bluebird'
import monq from 'monq'

import appConfig from '../appConfig'

const log = debug('Queue')
let INITIALIZED = false
let monqConn, Queue

async function get() {
	if( ! INITIALIZED ) {
		monqConn = monq(appConfig.dbString)
		Queue = Promise.promisifyAll(monqConn.queue('phoenix'))
	}
	return Queue
}

export default {
	get
}
