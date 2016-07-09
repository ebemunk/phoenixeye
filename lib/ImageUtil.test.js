import {expect} from 'chai'
import Promise from 'bluebird'
import sinon from 'sinon'
import {EOL} from 'os'

import {getGMInfo, getExiv2Info, __RewireAPI__} from './ImageUtil'

describe('ImageUtil', () => {
	describe('getGMInfo', () => {
		it('should call gm with a given filepath', async () => {
			const identifyStub = sinon.stub().callsArgWith(0, null, ()=>{})
			const gmStub = sinon.stub().returns({
				identify: identifyStub
			})
			__RewireAPI__.__Rewire__('gm', gmStub)
			await getGMInfo('/hur/dur')
			__RewireAPI__.__ResetDependency__('gm')
			expect(gmStub.calledWithExactly('/hur/dur')).to.be.true
			expect(identifyStub.calledOnce).to.be.true
		})
	})

	describe('getExiv2Info', () => {
		it('should parse exiv2 data', async () => {
			const fakeResult = [
				'Exif.Image.ImageWidth                        Short       1  12000',
				'Exif.Photo.PixelXDimension                   Long        1  10000',
				'Exif.Thumbnail.JPEGInterchangeFormatLength   Long        1  4532',
				'',
				'Xmp.xmp.MetadataDate                         XmpText    25  2013-09-11T22:33:54-04:00',
				'Xmp.dc.format                                XmpText    10  image/jpeg'
			].join(EOL)
			const expectedResult = {
				exif: {
					Image: {
						ImageWidth: '12000'
					},
					Photo: {
						PixelXDimension: '10000'
					},
					Thumbnail: {
						JPEGInterchangeFormatLength: '4532'
					}
				},
				xmp: {
					xmp: {
						MetadataDate: '2013-09-11T22:33:54-04:00'
					},
					dc: {
						format: 'image/jpeg'
					}
				}
			}
			__RewireAPI__.__Rewire__('exec', sinon.stub().callsArgWith(1, null, fakeResult))
			const exiv2Data = await getExiv2Info('some/path')
			__RewireAPI__.__ResetDependency__('exec')
			expect(exiv2Data).to.deep.equal(expectedResult)
		})

		it('should handle exiv2 code 253 bug', async () => {
			const fakeResult = 'Exif.Image.ImageWidth                        Short       1  12000'
			const expectedResult = {
				exif: {
					Image: {
						ImageWidth: '12000'
					}
				}
			}
			const fakeError = new Error('bug')
			fakeError.code = 253
			__RewireAPI__.__Rewire__('exec', sinon.stub().callsArgWith(1, fakeError, fakeResult))
			const exiv2Data = await getExiv2Info('some/path')
			__RewireAPI__.__ResetDependency__('exec')
			expect(exiv2Data).to.deep.equal(expectedResult)
		})

		it('should return empty obj on error', async () => {
			const fakeError = new Error()
			__RewireAPI__.__Rewire__('exec', sinon.stub().callsArgWith(1, fakeError))
			const exiv2Data = await getExiv2Info('some/path')
			__RewireAPI__.__ResetDependency__('exec')
			expect(exiv2Data).to.deep.equal({})
		})
	})

	describe('queueAnalysis', () => {
		it.skip('stub')
	})

	describe('imageSubmission', () => {
		it.skip('stub')
	})
})
