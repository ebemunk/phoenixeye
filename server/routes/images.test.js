import {expect} from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import DB from '../../lib/DB'
import server from '../'

const app = supertest(server)

describe('/api/images', () => {
	let db

	beforeEach(async () => {
		db = await DB.get()
	})

	afterEach(async () => {
		await db.destroy()
	})

	describe('GET /:permalink', () => {
		it('should return image if it exists', async () => {
			const permalink = 'herp'
			const image = await db.collections.image.create({
				permalink
			})
			let res = await app.get(`/api/images/${permalink}`)
			expect(res.status).to.equal(200)
			expect(res.body).to.be.an('object')
			expect(res.body).to.contain({permalink})
		})
	})

	describe('POST /upload', () => {
		it('should not accept multiple files', async () => {
			const res = await app
			.post('/api/images/upload')
			.attach('image1', 'test/testfiles/empty.jpg')
			.attach('image2', 'test/testfiles/valid.jpg')
			log(res.body)
		})
	})
})
