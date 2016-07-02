import fs from 'fs'
import path from 'path'
import debug from 'debug'
import Promise from 'bluebird'
import {Router} from 'express'
import bodyParser from 'body-parser'
import Busboy from 'busboy'
import HTTPError from 'node-http-error'
import wrap from 'express-async-wrap'

import appConfig from '../../appConfig'
import DB from '../../lib/DB'
import SubmittedFile from '../../lib/SubmittedFile'
import {imageSubmission} from '../../lib/ImageUtil'

const request = Promise.promisifyAll(require('request'))
const log = debug('images')
const jsonParser = bodyParser.json()
const router = new Router()

//get image by permalink
router.get('/:permalink', wrap(async (req, res, next) => {
	log('/:permalink')
	const db = await DB.get()
	let image = await db.collections.image.findOne({
		permalink: req.params.permalink
	})
	if( ! image ) {
		throw new HTTPError(404, 'no image with such permalink')
	}
	res.json(image)
}))

//upload image
router.post('/upload', wrap(async (req, res, next) => {
	log('/upload')
	//pipe req to busboy
	const busboy = new Busboy({
		headers: req.headers,
		limits: {
			files: appConfig.upload.maxFiles,
			fileSize: appConfig.upload.sizeLimit
		}
	})
	req.pipe(busboy)
	//details
	const uploadedImage = new SubmittedFile()
	uploadedImage.uploaderIP = req.ip || req.connection.remoteAddress
	let fileLimitReached = false
	//file handler
	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		log('  on file', fieldname, filename, encoding, mimetype)
		uploadedImage.file = file
		uploadedImage.originalFileName = filename
		//write upload to tmp folder
		const tmpFile = fs.createWriteStream(uploadedImage.tmpPath)
		file.pipe(tmpFile)
	})
	//file limit handler
	busboy.on('filesLimit', function () {
		log('  on file limit')
		uploadedImage.unlink()
		fileLimitReached = true
	})
	//upload is done
	busboy.on('finish', async () => {
		//make sure to avoid sending resp > once
		if( res.headersSent ) return
		log('  on upload finish')
		//cry if more than 1 file submitted
		if( fileLimitReached ) {
			return next(new HTTPError(400, 'only 1 file allowed'))
		}
		//cry if there was an error or file is too big
		if( ! uploadedImage.file ) {
			return next(new HTTPError(500, 'error while uploading the file'))
		} else if( uploadedImage.file.truncated ) {
			uploadedImage.unlink()
			return next(new HTTPError(413, 'file too big'))
		}
		log('  upload OK', uploadedImage)
		//go ahead with image submission
		try {
			const resp = await imageSubmission(uploadedImage)
			return res.json(resp)
		} catch (err) {
			return next(err)
		}
	})
}))

//submit url
router.post('/submit', jsonParser, wrap(async (req, res, next) => {
	log('/submit')
	const imageUrl = req.body.url
	if( ! imageUrl ) {
		throw new HTTPError(400, 'url is required')
	}
	// init image
	const downloadedImage = new SubmittedFile()
	downloadedImage.uploaderIP = req.ip || req.connection.remoteAddress
	downloadedImage.originalUrl = imageUrl
	// get preliminary info on url
	const resp = await request.headAsync(imageUrl)
	if( resp.headers['content-length'] > appConfig.upload.sizeLimit) {
		throw new HTTPError(413, 'file too big')
	}
	//get image meta
	const contentDisposition = resp.headers['content-disposition'] || ''
	const originalFileName = contentDisposition.match(/filename="(.+)"/)
	if( originalFileName ) {
		downloadedImage.originalFileName = originalFileName[1]
	} else {
		downloadedImage.originalFileName = path.basename(imageUrl)
	}
	//download the image
	request.get(imageUrl)
	//pipe to tmp path
	.pipe(fs.createWriteStream(downloadedImage.tmpPath))
	//process submission when it's over
	.on('close', async () => {
		//go ahead with image submission
		try {
			const resp = await imageSubmission(downloadedImage)
			return res.json(resp)
		} catch (err) {
			return next(err)
		}
	})
}))

export default router
