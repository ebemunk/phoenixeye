import fs from 'fs'
import debug from 'debug'
import Promise from 'bluebird'
import dataobjectParser from 'dataobject-parser'
import gm from 'gm'
gm.subClass({imageMagick: true})

import appConfig from '../appConfig'
import DB from './DB'

const exec = Promise.promisify(require('child_process').exec)
const S3 = Promise.promisifyAll(require('./S3').default)
const log = debug('ImageUtil')

async function getGMInfo(path) {
	log('getGMInfo', path)
	return Promise.fromNode(function (cb) {
		gm(path).identify(cb)
	})
}

async function getExiv2Info(path) {
	log('getExiv2Info', path)
	const dotParser = new dataobjectParser()
	return new Promise((resolve, reject) => {
		exec('exiv2 -pa ' + path, (err, stdout, stderr) => {
			//handle exiv2 bug where it returns code 253 even when there is data
			if( err && ! (err.code == 253 && stdout) ) {
				return reject(err)
			}
			//parsing exiv2 output
			let lines = stdout.split(/\r?\n/)
			for( let i = 0; i < lines.length; i++ ) {
				if( ! lines[i] ) continue
				let line = lines[i].replace(/\s+/g, ' ')
				let parsed = line.split(' ')
				let key = parsed[0]
				let value = parsed.slice(3).join(' ')
				dotParser.set(key, value)
			}
			return resolve(dotParser.data())
		})
	})
}

async function imageSubmission(submittedFile) {
	const db = await DB.get()
	try {
		//validate
		let image = await submittedFile.validate()
		//upload to s3
		let resp = await S3.uploadAsync({
			Key: `${image.permalink}/${image.permalink}.${image.type}`,
			Body: fs.createReadStream(submittedFile.tmpPath)
		})
		image.url = resp.Location
		//save to db
		let db = await DB.get()
		image = await db.collections.image.create(image)
		//submit job

		//return resp
		return {
			image,
			jobId: -1
		}
	} catch (err) {
		//return image data if duplicate
		//kinda hacky but meh
		const duplicate = /duplicate\: (.+)/.exec(err.message)
		if( duplicate ) {
			const md5 = duplicate[1]
			const image = await db.collections.image.findOne({
				md5
			})
			image.duplicate = true
			return {
				image
			}
		} else {
			throw err
		}
	} finally {
		submittedFile.unlink()
	}
}

export default {
	getGMInfo,
	getExiv2Info,
	imageSubmission
}
