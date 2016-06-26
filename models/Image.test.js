import {expect} from 'chai'
import Promise from 'bluebird'
import _ from 'lodash'
import sinon from 'sinon'
import HTTPError from 'node-http-error'

import DB from '../lib/DB'

describe('Image', () => {
	let db

	beforeEach(async () => {
		db = await DB.get()
	})

	afterEach(async () => {
		await db.destroy()
	})

	describe('toJSON', () => {
		it('hide uploaderIP field on json encode', async () => {
			const img = await db.collections.image.create({
				uploaderIP: '123'
			})
			expect(img).to.contain.keys('uploaderIP')
			expect(img.toJSON()).to.not.contain.keys('uploaderIP')
		})

		it('should turn qtables into 8x8 array', async () => {
			const qt = _.range(64).map(() => _.random(100)).join(',')
			const img = await db.collections.image.create({
				qtables: {1: qt}
			})
			expect(img.qtables['1']).to.be.a('string')
			const json = img.toJSON()
			expect(json.qtables).to.be.an.instanceof(Object)
			expect(json.qtables).to.have.keys('1')
			expect(json.qtables['1']).to.have.length(8)
			expect(json.qtables['1'][0]).to.have.length(8)
		})
	})
})
