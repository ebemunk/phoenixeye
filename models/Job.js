import debug from 'debug'
import {omit} from 'lodash'
import Waterline from 'waterline'

//eslint-disable-next-line no-unused-vars
const log = debug('Image')

let Job = {
	identity: 'job',
	tableName: 'jobs',
	connection: 'default',
	migrate: 'safe',
	autoCreatedAt: false,
	autoUpdatedAt: false,

	attributes: {
		name: 'string',
		params: {},
		queue: 'string',
		attempts: 'integer',
		timeout: 'integer',
		delay: 'date',
		priority: 'integer',
		status: 'string',
		enqueued: 'date',
		dequeued: 'date',
		ended: 'date',
		error: 'string',
		stack: 'string',

		//default instance overrides
		toJSON: function () {
			const obj = this.toObject()
			obj.params = omit(obj.params, 'requesterIP')
			return obj
		}
	}
}

export default Waterline.Collection.extend(Job)
