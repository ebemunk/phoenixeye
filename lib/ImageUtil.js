import fs from 'fs'
import debug from 'debug'
import Promise from 'bluebird'
import _ from 'lodash'
import dataobjectParser from 'dataobject-parser'

import appConfig from '../appConfig'
import DB from './DB'
import Queue from './Queue'

const exec = Promise.promisify(require('child_process').exec)
const S3 = Promise.promisifyAll(require('./S3').default)
const gm = require('gm').subClass({imageMagick: true})
const log = debug('ImageUtil')

export async function getGMInfo(path) {
	log('getGMInfo', path)
	const gmData = await Promise.fromNode(function (cb) {
		gm(path).identify(cb)
	})
	return {
		depth: _.get(gmData, 'Channel depth'),
		channelStatistics: _.get(gmData, 'Channel statistics'),
		imageStatistics: _.get(gmData, ['Image statistics', 'Overall']),
		gamma: _.get(gmData, 'gamma'),
		chromaticity: _.get(gmData, 'Chromaticity'),
	}
}

export async function getExiv2Info(path) {
	log('getExiv2Info', path)
	const dotParser = new dataobjectParser()
	const exiv2Data = await new Promise((resolve, reject) => {
		exec('exiv2 -pa ' + path, (err, stdout, stderr) => {
			//handle exiv2 bug where it returns code 253 even when there is data
			if( err && ! (err.code == 253 && stdout) ) {
				// return reject(err)
				return resolve({})
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
	return {
		exif: _.get(exiv2Data, 'Exif', null),
		xmp: _.get(exiv2Data, 'Xmp', null),
		iptc: _.get(exiv2Data, 'Iptc', null),
	}
}

export async function queueAnalysis(imageId, options) {
	debug('queueAnalysis')
	const params = {}
	params.imageId = imageId
	//ela
	if( options.ela ) {
		let quality = options.ela.quality || appConfig.defaultAnalysisOpts.ela.quality
		//clamp it between [0-100]
		params.ela = {
			quality: _.clamp(quality, 0, 100)
		}
	}
	//avgdist
	if( options.avgdist ) {
		params.avgdist = true
	}
	//lg
	if( options.lg ) {
		params.lg = true
	}
	//hsv
	if( options.hsv ) {
		let whitebg = (typeof options.hsv.whitebg == 'boolean' ? options.hsv.whitebg : appConfig.defaultAnalysisOpts.hsv.whitebg)
		params.hsv = {whitebg}
	}
	//labfast
	if( options.labfast ) {
		let whitebg = (typeof options.labfast.whitebg == 'boolean' ? options.labfast.whitebg : appConfig.defaultAnalysisOpts.labfast.whitebg)
		params.labfast = {whitebg}
	}
	//copymove
	if( options.copymove ) {
		let retain = options.copymove.retain || appConfig.defaultAnalysisOpts.copymove.retain
		let qcoeff = options.copymove.qcoeff || appConfig.defaultAnalysisOpts.copymove.qcoeff
		params.copymove = {
			//clamp between [1,16]
			retain: _.clamp(retain, 1, 16),
			//make sure > 1
			qcoeff: Math.max(qcoeff, 1)
		}
	}
	//autolevels
	if( options.autolevels ) {
		params.autolevels = true
	}
	//do we have any valid params?
	if( Object.keys(params).length < 1 ) {
		throw new Error('no valid params found')
	}
	//job meta
	params.requesterIP = options.requesterIP || null
	//put the job in the queue
	const queue = await Queue.get()
	const job = await queue.enqueueAsync('phoenix', params)
	return job
}

export async function imageSubmission(submittedFile) {
	const db = await DB.get()
	try {
		//validate
		let image = await submittedFile.validate()
		//upload to s3
		let resp = await S3.uploadAsync({
			Key: `${image.permalink}/${image.permalink}.${image.type}`,
			Body: fs.createReadStream(submittedFile.tmpPath)
		})
		image = {
			...image,
			url: resp.Location,
			s3key: resp.Key
		}
		//save to db
		image = await db.collections.image.create(image)
		//submit job
		const job = await queueAnalysis({
			...appConfig.defaultAnalysisOpts,
			imageId: image.id,
			uploaderIP: submittedFile.uploaderIP
		})
		//return resp
		return {
			image,
			jobId: job.data._id
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
