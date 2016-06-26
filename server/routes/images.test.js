import fs from 'fs'
import {expect} from 'chai'
import sinon from 'sinon'
import supertest from 'supertest'

import appConfig from '../../appConfig'
import DB from '../../lib/DB'
import server from '../'
import imagesRoute from './images'
import ImageUtil from '../../lib/ImageUtil'

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
			.attach('image1', 'test/files/empty.jpg')
			.attach('image2', 'test/files/valid.jpg')
			expect(res.status).to.equal(400)
			expect(res.body).to.exist
		})

		it('should not accept very large images (dims)', async () => {
			const res = await app
			.post('/api/images/upload')
			.attach('image', 'test/files/toolarge.jpg')
			expect(res.status).to.equal(413)
			expect(res.body).to.exist
		})

		it('should accept valid file', async () => {
			ImageUtil.__Rewire__('S3', {
				uploadAsync: sinon.stub().returns(Promise.resolve({
					Location: 'lalaland'
				}))
			})
			const res = await app
			.post('/api/images/upload')
			.attach('image', 'test/files/valid.jpg')
			ImageUtil.__ResetDependency__('S3')
			expect(res.status).to.equal(200)
			expect(res.body.image).to.have.property('md5', '4aba1a2b880a3760b368c9bbd5acccf1')
			expect(res.body.image).to.not.have.property('duplicate')
			expect(res.body).to.have.property('jobId')
			const image = await db.collections.image.findOne({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1'
			})
			expect(image).to.exist
		})

		it('should return image info if duplicate', async () => {
			const image = await db.collections.image.create({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1'
			})
			const res = await app
			.post('/api/images/upload')
			.attach('image', 'test/files/valid.jpg')
			expect(res.status).to.equal(200)
			expect(res.body.image).to.have.property('duplicate')
			expect(res.body).to.not.have.property('jobId')
		})
	})

	describe('POST /submit',() => {
		it('should require url', async () => {
			const res = await app
			.post('/api/images/submit')
			.send({derp: 'lol'})
			expect(res.status).to.equal(400)
			expect(res.body).to.exist
		})

		it('should not accept invalid url', async () => {
			const res = await app
			.post('/api/images/submit')
			.send({url: 'wrong'})
			expect(res.status).to.equal(500)
			expect(res.body).to.exist
		})

		it('should not accept very large images (dims)', async () => {
			imagesRoute.__Rewire__('request', {
				headAsync: sinon.stub().returns(Promise.resolve({
					headers:{
						'content-length': appConfig.upload.sizeLimit + 1
					}
				}))
			})
			const res = await app
			.post('/api/images/submit')
			.send({url: 'toobig'})
			imagesRoute.__ResetDependency__('request')
			expect(res.status).to.equal(413)
			expect(res.body).to.exist
		})

		it('should not accept very large images (size)', async () => {
			var rstream = fs.createReadStream('test/files/toolarge.jpg')
			imagesRoute.__Rewire__('request', {
				headAsync: sinon.stub().returns(Promise.resolve({
					headers:{
						'content-length': appConfig.upload.sizeLimit + 1
					}
				})),
				get: sinon.stub().returns(rstream)
			})
			const res = await app
			.post('/api/images/submit')
			.send({url: 'toolarge'})
			imagesRoute.__ResetDependency__('request')
			expect(res.status).to.equal(413)
			expect(res.body).to.exist
		})

		it('should not accept wrong type', async () => {
			var rstream = fs.createReadStream('test/files/wrongtype.txt')
			imagesRoute.__Rewire__('request', {
				headAsync: sinon.stub().returns(Promise.resolve({
					headers:{
						'content-length': 1
					}
				})),
				get: sinon.stub().returns(rstream)
			})
			const res = await app
			.post('/api/images/submit')
			.send({url: 'wrongtype'})
			imagesRoute.__ResetDependency__('request')
			expect(res.status).to.equal(415)
			expect(res.body).to.exist
		})

		it('should accept valid file', async () => {
			var rstream = fs.createReadStream('test/files/valid.jpg')
			imagesRoute.__Rewire__('request', {
				headAsync: sinon.stub().returns(Promise.resolve({
					headers:{
						'content-length': 1
					}
				})),
				get: sinon.stub().returns(rstream)
			})
			ImageUtil.__Rewire__('S3', {
				uploadAsync: sinon.stub().returns(Promise.resolve({
					Location: 'lalaland'
				}))
			})
			const res = await app
			.post('/api/images/submit')
			.send({url: 'valid'})
			imagesRoute.__ResetDependency__('request')
			ImageUtil.__ResetDependency__('S3')
			expect(res.status).to.equal(200)
			expect(res.body).to.contain.property('image')
			const image = await db.collections.image.findOne({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1'
			})
			expect(image).to.exist
			expect(image.url).to.equal('lalaland')
		})

		it('should return image info if duplicate', async () => {
			const image = await db.collections.image.create({
				md5: '4aba1a2b880a3760b368c9bbd5acccf1'
			})
			var rstream = fs.createReadStream('test/files/valid.jpg')
			imagesRoute.__Rewire__('request', {
				headAsync: sinon.stub().returns(Promise.resolve({
					headers:{
						'content-length': 1
					}
				})),
				get: sinon.stub().returns(rstream)
			})
			imagesRoute.__Rewire__('S3', {
				uploadAsync: sinon.stub().returns(Promise.resolve({
					Location: 'lalaland'
				}))
			})
			const res = await app
			.post('/api/images/upload')
			.attach('image', 'test/files/valid.jpg')
			imagesRoute.__ResetDependency__('request')
			imagesRoute.__ResetDependency__('S3')
			expect(res.status).to.equal(200)
			expect(res.body.image).to.have.property('duplicate')
			expect(res.body).to.not.have.property('jobId')
		})
	})

})
