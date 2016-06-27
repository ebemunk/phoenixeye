import {expect} from 'chai'
import Promise from 'bluebird'
import sinon from 'sinon'
import {EOL} from 'os'

import ImageUtil from './ImageUtil'

describe('ImageUtil', () => {
	describe('getGMInfo', () => {
		it('should call gm with a given filepath', async () => {
			const identifyStub = sinon.stub().callsArgWith(0, null, ()=>{})
			const gmStub = sinon.stub().returns({
				identify: identifyStub
			})
			ImageUtil.__Rewire__('gm', gmStub)
			await ImageUtil.getGMInfo('/hur/dur')
			ImageUtil.__ResetDependency__('gm')
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
				'Xmp.xmp.MetadataDate                         XmpText    25  2013-09-11T22:33:54-04:00',
				'Xmp.dc.format                                XmpText    10  image/jpeg'
			].join(EOL)
			const expectedResult = {
				Exif: {
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
				Xmp: {
					xmp: {
						MetadataDate: '2013-09-11T22:33:54-04:00'
					},
					dc: {
						format: 'image/jpeg'
					}
				}
			}
			ImageUtil.__Rewire__('exec', sinon.stub().callsArgWith(1, null, fakeResult))
			const exiv2Data = await ImageUtil.getExiv2Info('some/path')
			ImageUtil.__ResetDependency__('exec')
			expect(exiv2Data).to.deep.equal(expectedResult)
		})
	})

	describe('queueAnalysis', () => {
		it.skip('stub')
	})

	describe('imageSubmission', () => {
		it.skip('stub')
	})
})
