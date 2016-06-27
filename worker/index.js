import debug from 'debug'
import monq from 'monq'
import rollbar from 'rollbar'

import appConfig from '../appConfig'
import DB from '../lib/DB'
import {handleJob} from '../lib/WorkerUtil'

const log = debug('server')

const monqConn = monq(appConfig.dbString)
const worker = monqConn.worker(['phoenix'])

rollbar.init(appConfig.analytics.rollbar.serverToken, {
	environment: appConfig.env,
	endpoint: 'https://api.rollbar.com/api/1/'
})
rollbar.handleUncaughtExceptions()

worker.register({
	phoenix: handleJob
})
worker.start()
log('worker started')
