import debug from 'debug'
import {Router} from 'express'
import {json as jsonParser} from 'body-parser'
// import Busboy from 'busboy'
import fs from 'fs'
// import request from 'request'
import Promise from 'bluebird'
import HTTPError from 'node-http-error'
import wrap from 'express-async-wrap'

import appConfig from '../../appConfig'
import DB from '../../lib/DB'
import SubmittedFile from '../../lib/SubmittedFile'

const log = debug('images')
const router = new Router()

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

router.post('/upload', wrap(async (req, res) => {
	//pipe req to busboy
	const busboy = new Busboy({
		headers: req.headers,
		limits: {
			files: appConfig.upload.maxFiles,
			fileSize: config.upload.sizeLimit
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
			throw new HTTPError(400, 'only 1 file allowed')
		}
		//cry if there was an error or file is too big
		if( ! uploadedImage.file ) {
			throw new HTTPError(500, 'error while uploading the file')
		} else if( uploadedImage.file.truncated ) {
			uploadedImage.unlink()
			throw new HTTPError(413, 'file too big')
		}
		log('  upload OK', uploadedImage)
		//go ahead with image submission
		let image = await uploadedImage.validate()
		res.json({
			image
		})
		// if( image.)
		// uploadedImage.fileChecks(req.app.models.image)
		// .then(function (image) {
		// 	if( image.duplicate ) {
		// 		return [image, {data: {_id: null}}]
		// 	} else {
		// 		return [image, image.queueAnalysis(config.defaultAnalysisOpts)]
		// 	}
		// })
		// .spread(function (image, job) {
		// 	return res.json({
		// 		image: image,
		// 		jobId: job.data._id
		// 	})
		// })
		// .catch(function (err) {
		// 	return next(err)
		// })
	})
}))
export default router
