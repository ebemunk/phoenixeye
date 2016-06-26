import {expect} from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import DB from '../../lib/DB'
import server from '../'

const app = supertest(server)

describe('/api/analyses', () => {
	let db

	beforeEach(async () => {
		db = await DB.get()
	})

	afterEach(async () => {
		await db.destroy()
	})

	describe('/:imageId', () => {
		it('should return analyses if imageId has them', async () => {
			const randomId = 123
			const analysis = await db.collections.analysis.create({
				imageId: randomId,
				path: 'mypath',
				fileName: 'fn'
			})
			let res = await app.get(`/api/analyses/${randomId}`)
			expect(res.status).to.equal(200)
			expect(res.body).to.be.an('array')
			expect(res.body).to.not.be.empty
		})

		it('should return empty array if none found', async () => {
			let res = await app.get(`/api/analyses/nope`)
			expect(res.body).to.have.length(0)
		})
	})
})
