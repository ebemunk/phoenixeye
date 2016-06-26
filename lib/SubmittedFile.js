import debug from 'debug'
import Promise from 'bluebird'
import shortId from 'shortid'
import HTTPError from 'node-http-error'
import dataobjectParser from 'dataobject-parser'

const fs = Promise.promisifyAll(require('fs'))
const md5file = Promise.promisify(require('md5-file'))
const exec = Promise.promisify(require('child_process').exec)
const imageSize = Promise.promisify(require('image-size'))

import config from '../appConfig'
import DB from './DB'

const log = debug('server:models:SubmittedFile')

export default class SubmittedFile {
	constructor() {
		this.tmpPath = 'tmp/' + Date.now().toString() + '_' + Math.random().toString()
	}

	async unlink() {
		log('unlink')
		return fs.unlinkAsync(this.tmpPath)
	}

	async checkType() {
		log('checkType')
		let stdout = await exec(`file --mime-type ${this.tmpPath}`)
		//parse mime from the output
		let mime = stdout.match(/.*: (.*)/)[1]
		//check if file type is allowed
		if( ! config.upload.acceptedTypes[mime] ) {
			throw new HTTPError(415, 'file type not accepted')
		}
		return config.upload.acceptedTypes[mime]
	}

	async checkDims() {
		log('checkDims')
		// get image size and calculate area
		let dimensions = await imageSize(this.tmpPath)
		let mp = dimensions.width * dimensions.height
		if( mp > config.upload.maxDims ) {
			throw new HTTPError(413, 'file dimensions too big')
		}
		return {
			width: dimensions.width,
			height: dimensions.height
		}
	}

	async checkSize() {
		log('checkSize')
		let {size} = await fs.statAsync(this.tmpPath)
		if( size > config.upload.sizeLimit ) {
			throw new HTTPError(413, 'file size too big')
		}
		return size
	}

	async checkMD5() {
		log('checkMD5')
		let fileMd5 = await md5file(this.tmpPath)
		let db = await DB.get()
		let image = await db.collections.image.findOne({md5: fileMd5})
		if( image ) throw new HTTPError(400, `duplicate: ${fileMd5}`)
		return fileMd5
	}

	async validate() {
		log('validate')
		//image data to save
		let image = {
			permalink: shortId.generate(),
			originalFileName: this.originalFileName,
			originalUrl: this.originalUrl
		}
		image.type = await this.checkType()
		image.dims = await this.checkDims()
		image.size = await this.checkSize()
		image.md5 = await this.checkMD5()
		return image
	}
}
