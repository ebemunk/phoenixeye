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

//webpack dev server
if( process.env.NODE_ENV === 'development' ) {
	const webpack = require('webpack')
	const webpackDevMiddleware = require('webpack-dev-middleware')
	const webpackHotMiddleware = require('webpack-hot-middleware')
	const clientConfig = require('../webpack/webpack.client.config.js')

	const compiler = webpack(clientConfig)
	const middleware = webpackDevMiddleware(compiler, {
		publicPath: clientConfig.output.publicPath,
		contentBase: 'dist'
	})

	server.use(middleware)
	server.use(webpackHotMiddleware(compiler))
}

// static assets
server.use('/', express.static('dist'))

server.use('/*', (req, res, next) => {
	res.sendFile('index.html', {root: 'dist'})
})

//error handler
server.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		error: err.message,
		stack: err.stack
	})
})

//listen if not test
if( process.env.NODE_ENV !== 'test' ) {
	server.listener = server.listen(appConfig.port, () => {
		log(`server running on port ${appConfig.port}`)
	})
}

export default server
