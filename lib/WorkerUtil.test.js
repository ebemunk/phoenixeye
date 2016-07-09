import {expect} from 'chai'
import sinon from 'sinon'

import appConfig from '../appConfig'
import DB from './DB'
import {handleJob, __RewireAPI__} from './WorkerUtil'

describe('WorkerUtil', () => {
	describe('private', () => {
		describe('getJobCmd', () => {
			it('should construct cmd with correct params', () => {
				const getJobCmd = __RewireAPI__.__GetDependency__('getJobCmd')
				const cmd = getJobCmd(appConfig.defaultAnalysisOpts, 'mypath/myname')
				const strings = [
					'-f mypath/myname',
					'-o tmp',
					'-json',
					`-ela ${appConfig.defaultAnalysisOpts.ela.quality}`,
					'-avgdist',
					'-lg',
					'-hsv',
					'-labfast',
					`-copymove ${appConfig.defaultAnalysisOpts.copymove.retain} ${appConfig.defaultAnalysisOpts.copymove.qcoeff}`
				].forEach(string => expect(cmd).to.contain(string))
				expect(cmd).to.not.contain('-autolevels')
			})
		})

		describe('getImage', () => {
			let getImage

			before(() => {
				getImage = __RewireAPI__.__GetDependency__('getImage')
			})

			it('should reject if no image found', async () => {
				let err
				try {
					await getImage(666)
				} catch (e) {
					err = e
				}
				expect(err).to.exist
				expect(err).to.be.an.instanceof(Error)
			})

			it('should return image if it exists', async () => {
				const db = await DB.get()
				const img = await db.collections.image.create({
					id: 1
				})
				const retrieved = await getImage(1)
				expect(retrieved).to.have.keys(img)
			})
		})

		describe('downloadImage', () => {
			const getObjectAsyncStub = sinon.stub().returns(Promise.resolve({
				Body: 'voluptuous'
			}))
			const writeFileAsyncStub = sinon.stub().returns(Promise.resolve())
			let downloadImage

			before(() => {
				downloadImage = __RewireAPI__.__GetDependency__('downloadImage')
			})

			beforeEach(() => {
				__RewireAPI__.__Rewire__('fs', {
					writeFileAsync: writeFileAsyncStub
				})
				__RewireAPI__.__Rewire__('S3', {
					getObjectAsync: getObjectAsyncStub
				})
			})

			afterEach(() => {
				__RewireAPI__.__ResetDependency__('fs')
				__RewireAPI__.__ResetDependency__('S3')
			})

			it('should call S3 with correct params', async () => {
				await downloadImage({
					s3key: 'key'
				})
				expect(getObjectAsyncStub.calledWithExactly({
					Bucket: appConfig.aws.bucket,
					Key: 'key'
				})).to.be.true
			})

			it('should save file to tmp location', async () => {
				await downloadImage({
					s3key: 'key'
				})
				expect(writeFileAsyncStub.calledWithExactly(
					sinon.match('tmp/'),
					'voluptuous'
				)).to.be.true
			})
		})

		describe('runCmd', () => {
			it.skip('not worth it')
		})

		describe('constructS3Key', () => {
			let constructS3Key

			before(() => {
				constructS3Key = __RewireAPI__.__GetDependency__('constructS3Key')
			})

			it('should correctly construct s3 key', () => {
				const key = constructS3Key({
					type: 'copymove',
					params: {
						retain: '3',
						qcoeff: 2
					}
				})
				const strings = [
					'copymove',
					'retain_3',
					'qcoeff_2'
				].forEach(s => expect(key).to.contain(s))
			})

			it('should convert true|false to 1|0', () => {
				const key = constructS3Key({
					type: 'hsv',
					params: {
						whitebg: 'true',
					}
				})
				const strings = [
					'hsv',
					'whitebg_1',
				].forEach(s => expect(key).to.contain(s))
			})
		})

		describe('uploadAnalysis', () => {
			const uploadAsyncStub = sinon.stub().returns(Promise.resolve({
				Location: 'derpy'
			}))
			const createReadStreamStub = sinon.stub().returns('stream')
			let uploadAnalysis

			before(() => {
				uploadAnalysis = __RewireAPI__.__GetDependency__('uploadAnalysis')
			})

			beforeEach(() => {
				__RewireAPI__.__Rewire__('fs', {
					createReadStream: createReadStreamStub
				})
				__RewireAPI__.__Rewire__('S3', {
					uploadAsync: uploadAsyncStub
				})
			})

			afterEach(() => {
				__RewireAPI__.__ResetDependency__('fs')
				__RewireAPI__.__ResetDependency__('S3')
			})

			it('should call S3 with correct params', async () => {
				const analysis = await uploadAnalysis({
					type: 'ela',
					params: {quality: 3}
				})
				expect(uploadAsyncStub.calledWithExactly({
					Key: sinon.match('ela__quality_3'),
					Body: 'stream'
				})).to.be.true
				expect(analysis.url).to.equal('derpy')
			})
		})

		describe('getImageMeta', () => {
			it.skip('not worth it')
		})
	})

	describe('handleJob', () => {
		let db
		let image
		let uploadAnalysisStub

		beforeEach(async () => {
			db = await DB.get()
			image = await db.collections.image.create({t: 'test'})
			__RewireAPI__.__Rewire__('getImage', sinon.stub().returns(Promise.resolve(image)))
			__RewireAPI__.__Rewire__('downloadImage', sinon.stub().returns(Promise.resolve()))
			__RewireAPI__.__Rewire__('getImageMeta', sinon.stub().returns(Promise.resolve({
				gmData: {gm: 'yes'},
				exiv2Data: {exiv: 'np'}
			})))
			__RewireAPI__.__Rewire__('runCmd', sinon.stub().returns(Promise.resolve({
				ela: {type: 'ela'},
			})))
			uploadAnalysisStub = sinon.stub().returns(Promise.resolve({
				imageId: image.id,
				type: 'ela',
				createdAt: new Date(3)
			}))
			__RewireAPI__.__Rewire__('uploadAnalysis', uploadAnalysisStub)
		})

		afterEach(() => {
			__RewireAPI__.__ResetDependency__('getImage')
			__RewireAPI__.__ResetDependency__('downloadImage')
			__RewireAPI__.__ResetDependency__('getImageMeta')
			__RewireAPI__.__ResetDependency__('runCmd')
			__RewireAPI__.__ResetDependency__('uploadAnalysis')
		})

		it('should save new data to image & set metaComplete', async () => {
			await handleJob({}, ()=>{})
			const saved = await db.collections.image.findOne({t: 'test'})
			expect(saved).to.have.contain({
				gm: 'yes'
			})
			expect(saved.metaComplete).to.be.true
		})

		it('should call uploadAnalysis as many times as needed', async () => {
			await handleJob({}, ()=>{})
			expect(uploadAnalysisStub.callCount).to.equal(1)
		})

		it('should only keep the most recent 3 analyss', async () => {
			await db.collections.analysis.create([
				{imageId: image.id, type: 'ela', createdAt: new Date(0)},
				{imageId: image.id, type: 'ela', createdAt: new Date(1)},
				{imageId: image.id, type: 'ela', createdAt: new Date(2)},
			])
			await handleJob({}, ()=>{})
			const analyses = await db.collections.analysis.find({
				imageId: image.id
			})
			expect(analyses).to.have.length(3)
			const oldest = await db.collections.analysis.findOne({
				createdAt: new Date(0)
			})
			expect(oldest).to.not.exist
		})
	})
})
