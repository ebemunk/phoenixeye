import debug from 'debug'
import Promise from 'bluebird'
import _ from 'lodash'
import Waterline from 'waterline'
import mongoAdapter from 'sails-mongo'
import memoryAdapter from 'sails-memory'

import appConfig from '../appConfig'
import Image from '../models/Image'
import Analysis from '../models/Analysis'
import Job from '../models/Job'

const log = debug('server:ORM')

class DB extends Waterline {
	constructor(options) {
		super()
		let defaultOptions = {
			adapters: {
				mongo: mongoAdapter,
				memory: memoryAdapter
			},
			connections: {
				default: {
					adapter: 'memory'
				},
				memory: {
					adapter: 'memory'
				}
			}
		}

		if( process.env.NODE_ENV !== 'test' ) {
			defaultOptions.connections.mongoLab = {
				adapter: 'mongo',
				url: appConfig.dbString
			}
			defaultOptions.connections.default = defaultOptions.connections.mongoLab
		}

		[Image, Analysis, Job].map(::this.loadCollection)
		this.options = _.assign({}, defaultOptions, options)
	}

	async initialize() {
		try {
			await Promise.fromCallback(cb => super.initialize(this.options, cb))
			INITIALIZED = true
		} catch (e) {
			if( e.name !== 'AdapterError' ) throw e
		}
	}

	async destroy() {
		if( process.env.NODE_ENV === 'production' ) throw new Error('cannot run destroy() in production')
		if( ! _.isEmpty(this.collections) ) {
			await Promise.all(
				_.map(this.collections, async collection => collection.destroy({}))
			)
		}
		if( _.isFunction(super.destroy) ) {
			await super.destroy()
		}
	}
}

const db = new DB()
let INITIALIZED = false

async function get() {
	if( ! INITIALIZED ) {
		await db.initialize()
	}
	return db
}

export default {
	get
}
