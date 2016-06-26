import {expect} from 'chai'
import supertest from 'supertest'

import server from './'

const app = supertest(server)

describe('/api', () => {
	describe('/', () => {
		it('should return uptime', async () => {
			let res = await app.get('/api')
			expect(res.status).to.equal(200)
			expect(res.body.status).to.equal('running')
			expect(res.body).to.have.property('uptime')
		})

		it('should return error message if theres an unexpected error', async () => {
			let res = await app
			.post('/api/images/upload')
			.set('content-type', 'application/json')
			.send('wrong')
			expect(res.body).to.have.property('error')
		})
	})
})

describe.skip('/', function () {
	it('should return index.html for any non-matching route', async () => {
		let res = await app
		.get('/test')
		expect(res.text).to.contain('<!doctype html>')
	})
})
