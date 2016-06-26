import {expect} from 'chai'
import Promise from 'bluebird'
import _ from 'lodash'
import sinon from 'sinon'
import HTTPError from 'node-http-error'

import DB from '../lib/DB'

describe('Job', () => {
	let db

	beforeEach(async () => {
		db = await DB.get()
	})

	afterEach(async () => {
		await db.destroy()
	})

	describe('toJSON', () => {
		it('should hide requesterIP field on json encode', async () => {
			const job = await db.collections.job.create({
				params: {
					requesterIP: '123'
				}
			})
			expect(job.params).to.contain.keys('requesterIP')
			expect(job.toJSON()).to.not.contain.keys('requesterIP')
		})
	})
})
