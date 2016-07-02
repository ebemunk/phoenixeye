import Promise from 'bluebird'
import sinon from 'sinon'

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
