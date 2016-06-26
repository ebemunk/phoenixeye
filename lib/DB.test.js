import {expect} from 'chai'
import Waterline from 'waterline'

import DB from './DB'

describe('DB', () => {
	let db

	before(async () => {
		db = await DB.get()
	})

	after(async () => {
		await db.destroy()
	})

	it('should expose get()', () => {
		expect(DB).to.have.keys('get')
	})

	describe('get()', () => {
		it('should return a singleton', async () => {
			const DB2 = require('./DB').default
			let db2 = await DB2.get()
			expect(db).to.equal(db2)
		})

		it('should extend Waterline', () => {
			expect(db).to.be.an.instanceof(Waterline)
		})
	})
})
