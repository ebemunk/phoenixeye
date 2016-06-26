import {expect} from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import DB from '../../lib/DB'
import server from '../'

const app = supertest(server)

describe('/api/jobs', () => {
	let db

	beforeEach(async () => {
		db = await DB.get()
	})

	afterEach(async () => {
		await db.destroy()
	})

	describe('/:jobId', () => {
		it('should return 404 if no such jobId exists', async () => {
			const res = await app.get('/api/jobs/zzz')
			expect(res.status).to.equal(404)
		})

		it('should return job if it exists', async () => {
			const randomId = 123
			await db.collections.job.create({
				id: randomId
			})
			const res = await app.get(`/api/jobs/${randomId}`)
			expect(res.status).to.equal(200)
			expect(res.body).to.have.property('id')
		})
	})
})
