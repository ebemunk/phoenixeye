import debug from 'debug'
import express from 'express'
import compression from 'compression'
import rollbar from 'rollbar'

import appConfig from '../appConfig'
import DB from '../lib/DB'
import routes from './routes'

const log = debug('server')

//rollbar error handler
rollbar.init(appConfig.analytics.rollbar.serverToken, {
	environment: appConfig.env,
	endpoint: 'https://api.rollbar.com/api/1/'
})
rollbar.handleUncaughtExceptions()

//init server
const server = express()
server.disable('x-powered-by')
server.use(compression({
	threshold: 0
}))

//api uptime
server.get('/api', (req, res) => {
	res.json({
		status: 'running',
		uptime: process.uptime()
	})
})

//route setup
server.use('/api/images', routes.images)
server.use('/api/analyses', routes.analyses)
server.use('/api/jobs', routes.jobs)

//static assets
server.use('/*', (req, res, next) => {
	res.sendFile('index.html', {root: __dirname + '../'})
})

//error handler
server.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		error: err.message,
		stack: err.stack
	})
})

//run if main
if( require.main === module ) {
	server.listener = server.listen(appConfig.port, () => {
		log(`server running on port ${appConfig.port}`)
	})
}

export default server
