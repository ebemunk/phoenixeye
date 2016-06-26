import {expect} from 'chai'
import Promise from 'bluebird'
import sinon from 'sinon'
import HTTPError from 'node-http-error'

import appConfig from '../appConfig'
import DB from './DB'
import SubmittedFile from './SubmittedFile'

Promise.onPossiblyUnhandledRejection(console.log)
Promise.config({longStackTraces: false})

describe('SubmittedFile', () => {
	let submittedFile
	let db

	beforeEach(async () => {
		submittedFile = new SubmittedFile()
		db = await DB.get()
	})

	afterEach(async () => {
		await db.destroy()
	})

	describe('checkType', () => {
		it('calls `file` with correct arguments', async () => {
			let execStub = sinon.stub().returns('derp.jpg: image/jpeg')
			SubmittedFile.__Rewire__('exec', execStub)
			await submittedFile.checkType()
			SubmittedFile.__ResetDependency__('exec')
			expect(execStub.calledWithExactly(`file --mime-type ${submittedFile.tmpPath}`)).to.be.true
		})

		it('returns 415 error for invalid files', async () => {
			SubmittedFile.__Rewire__('exec', sinon.stub().returns('derp.txt: text/plain'))
			let err
			try {
				await submittedFile.checkType()
			} catch (e) {
				err = e
			}
			SubmittedFile.__ResetDependency__('exec')
			expect(err).to.exist
			expect(err).to.be.an.instanceof(HTTPError)
			expect(err.status).to.equal(415)
		})
	})

	describe('checkDims', () => {
		it('returns 413 error for invalid files', async () => {
			SubmittedFile.__Rewire__('imageSize', sinon.stub().returns({
				width: appConfig.upload.maxDims + 1,
				height: 1
			}))
			let err
			try {
				await submittedFile.checkDims()
			} catch (e) {
				err = e
			}
			SubmittedFile.__ResetDependency__('imageSize')
			expect(err).to.exist
			expect(err).to.be.an.instanceof(HTTPError)
			expect(err.status).to.equal(413)
		})

		it('resolves to dimensions', async () => {
			SubmittedFile.__Rewire__('imageSize', sinon.stub().returns({
				width: 1,
				height: 1
			}))
			let dims = await submittedFile.checkDims()
			SubmittedFile.__ResetDependency__('imageSize')
			expect(dims).to.have.keys(['height', 'width'])
		})
	})

	describe('checkSize', () => {
		it('returns 413 error for files that are too big', async () => {
			SubmittedFile.__Rewire__('fs', {
				statAsync: sinon.stub().returns(Promise.resolve({
					size: appConfig.upload.sizeLimit + 1
				}))
			})
			let err
			try {
				await submittedFile.checkSize()
			} catch (e) {
				err = e
			}
			SubmittedFile.__ResetDependency__('fs')
			expect(err).to.exist
			expect(err).to.be.an.instanceof(HTTPError)
			expect(err.status).to.equal(413)
		})

		it('resolves to file size', async () => {
			SubmittedFile.__Rewire__('fs', {
				statAsync: sinon.stub().returns(Promise.resolve({
					size: 123
				}))
			})
			let size = await submittedFile.checkSize()
			SubmittedFile.__ResetDependency__('fs')
			expect(size).to.equal(123)
		})
	})

	describe('checkMD5', () => {
		it('throws 400 error if md5 exists in db', async () => {
			await db.collections.image.create({
				md5: 'abc'
			})
			SubmittedFile.__Rewire__('md5file', sinon.stub().returns('abc'))
			let err
			try {
				await submittedFile.checkMD5()
			} catch (e) {
				err = e
			}
			SubmittedFile.__ResetDependency__('md5file')
			expect(err).to.exist
			expect(err).to.be.an.instanceof(HTTPError)
			expect(err.status).to.equal(400)
		})

		it('resolves to md5 string if image doesnt exist in db', async () => {
			SubmittedFile.__Rewire__('md5file', sinon.stub().returns('abc'))
			let md5 = await submittedFile.checkMD5()
			SubmittedFile.__ResetDependency__('md5file')
			expect(md5).to.equal('abc')
		})
	})

	describe('validate', () => {
		it('should return image data if ok', async () => {
			SubmittedFile.__Rewire__('md5file', sinon.stub().returns('abc'))
			SubmittedFile.__Rewire__('exec', sinon.stub().returns('file.jpg: image/jpeg'))
			SubmittedFile.__Rewire__('fs', {
				statAsync: sinon.stub().returns(Promise.resolve({
					size: 1
				}))
			})
			SubmittedFile.__Rewire__('imageSize', sinon.stub().returns(Promise.resolve({
				height: 1,
				width: 1
			})))
			let image = await submittedFile.validate()
			SubmittedFile.__ResetDependency__('fs')
			SubmittedFile.__ResetDependency__('exec')
			SubmittedFile.__ResetDependency__('imageSize')
			SubmittedFile.__ResetDependency__('md5file')
			expect(image).to.have.keys([
				'type',
				'size',
				'dims',
				'md5',
				'permalink',
				'originalFileName',
				'originalUrl'
			])
		})
	})
})
