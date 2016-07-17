import Promise from 'bluebird'
import sinon from 'sinon'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
global.expect = chai.expect

import DB from '../lib/DB'
import Queue from '../lib/Queue'

let db

//promise config
Promise.onPossiblyUnhandledRejection(console.log)
Promise.config({longStackTraces: false})

//mock global stuff
before(() => {
	function monqMock(queue, params, callback) {
		return callback(null, {
			data: {
				_id: Math.random(),
				params: params
			}
		})
	}
	Queue.__Rewire__('monq', dbString => {
		return {
			queue: sinon.stub().returns({
				enqueue: monqMock
			})
		}
	})
})

beforeEach(async () => {
	db = await DB.get()
})

afterEach(async () => {
	await db.destroy()
})

//unmock global stuff
after(() => {
	Queue.__ResetDependency__('monq')
})

//prepare jsdom and expose globals for angular stuff
import {jsdom} from 'jsdom'
global.document = jsdom('<html><head><script></script></head><body></body></html>')
global.window = global.document.defaultView
global.navigator = window.navigator = {}
global.Node = window.Node
global.window.mocha = {}
global.window.beforeEach = beforeEach
global.window.afterEach = afterEach
//reload angular errdayy
delete require.cache[require.resolve('angular')]
delete require.cache[require.resolve('angular/angular')]
delete require.cache[require.resolve('angular-mocks')]
require('angular/angular')
require('angular-mocks')
//expose more
global.angular = window.angular
//webpack import handling in tests
import fs from 'fs'
const noop = () => {}
require.extensions['.css'] = noop
require.extensions['.less'] = noop
require.extensions['.html'] = (module, path) => {
	module.exports = fs.readFileSync(path).toString()
}
