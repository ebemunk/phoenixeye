import {expect} from 'chai'

import appConfig from '../appConfig'
import DB from './DB'
import {handleJob, __RewireAPI__} from './WorkerUtil'

describe.only('WorkerUtil', () => {
	describe('private', () => {
		describe('getJobCmd', () => {
			it('should construct cmd with correct params', () => {
				const getJobCmd = __RewireAPI__.__GetDependency__('getJobCmd')
				const cmd = getJobCmd(appConfig.defaultAnalysisOpts, 'mypath/myname')
				const strings = [
					'-f mypath/myname',
					'-o mypath',
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
			it.skip('stub')
		})

		describe('runCmd', () => {
			it.skip('stub')
		})

		describe('constructFilename', () => {
			it('should append parameters to the filename', () => {
				const constructFilename = __RewireAPI__.__GetDependency__('constructFilename')
				// const newPath = constructFilename()
			})
		})

	})
})
