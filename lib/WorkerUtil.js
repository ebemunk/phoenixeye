import debug from 'debug'
import Promise from 'bluebird'
import _ from 'lodash'

import appConfig from '../appConfig'
import DB from './DB'
import ImageUtil from './ImageUtil'

const S3 = Promise.promisifyAll(require('./S3').default)
const fs = Promise.promisifyAll(require('fs'))
const exec = Promise.promisify(require('child_process').exec)
const log = debug('handleJob')
const wtf = getImage

//construct job string (command call) from parameters
function getJobCmd(params, path) {
	let command = `${appConfig.bin.phoenix} -f ${path} -o tmp -json`
	//error level analysis
	if( params.ela ) {
		command += ` -ela ${params.ela.quality}`
	}
	//avgdist
	if( params.avgdist ) {
		command += ' -avgdist'
	}
	//luminance gradient
	if( params.lg ) {
		command += ' -lg'
	}
	//hsv histogram
	if( params.hsv ) {
		command += ' -hsv ' + (params.hsv.whitebg ? '1' : '0')
	}
	//lab histogram
	if( params.labfast ) {
		command += ' -labfast ' + (params.labfast.whitebg ? '1' : '0')
	}
	//copy-move
	if( params.copymove ) {
		command += ' -copymove ' + params.copymove.retain + ' ' + params.copymove.qcoeff
	}
	//autolevels
	if( params.autolevels ) {
		command += ' -autolevels'
	}
	return command
}

//get image from db
async function getImage(id) {
	//get image from db
	const db = await DB.get()
	const image = await db.collections.image.findOne({
		id: id
	})
	if( ! image ) {
		throw new Error(`no image found with id: ${id}`)
	}
	return image
}

//download from s3
async function downloadImage(image) {
	log('downloading from', image.s3key)
	const file = await S3.getObjectAsync({
		Bucket: appConfig.aws.bucket,
		Key: 'B1bFjWcpB/B1bFjWcpB.jpg'//image.s3key
	})
	//save locally to tmp
	const path = 'tmp/' + Date.now().toString() + '_' + Math.random().toString()
	log('saving to', path)
	await fs.writeFileAsync(path, file.Body)
	return path
}

//run phoenix cmd
async function runCmd(params, path) {
	const cmd = getJobCmd(params, path)
	log('command', cmd)
	const stdout = await exec(cmd)
	log('response', stdout)
	//parse output
	const output = JSON.parse(stdout)
	return output
}

//construct new filename for saved analysis
function constructS3Key(analysis) {
	const now = new Date().getTime()
	const filename = _(analysis.params)
	.map((val, key) => {
		if( val === 'true' || val === 'false' ) val = val ? '1' : '0'
		return `${key}_${val}`
	})
	.compact()
	.unshift(analysis.type)
	.unshift(now)
	.join('__')
	return `${filename}.png`
}

// upload to s3
async function uploadAnalyses(analysis) {
	const s3key = constructS3Key(analysis)
	const resp = await S3.uploadAsync({
		Key: s3key,
		Body: fs.createReadStream(analysis.filename)
	})
	return {
		...analysis,
		s3key: s3key
	}
}

export async function handleJob(params, callback) {
	Promise.onPossiblyUnhandledRejection(err => {
		log('error while processing', err)
		callback(err)
	})
	log('handleJob', params)
	const image = await getImage(params.imageId)
	const path = await downloadImage(image)
	//get image metadata
	
	const output = await runCmd(params, path)
	//save estimates & qtables if available
	image.imagemagickQuality = output.imagick_estimate || image.imagick_estimate || null
	image.hackerfactorQuality = output.hf_estimate || image.hf_estimate || null
	image.qtables = output.qtables || image.qtables || null
	await image.save()
	//remove img meta from output & select analyses
	const analysesOutput = _(output).omit([
		'hf_estimate',
		'imagick_estimate',
		'qtables'
	])
	.map((val, key) => {
		return {
			type: key,
			filename: val.filename,
			params: _.omit(val, 'filename')
		}
	})
	.value()
	//upload analyses to s3
	const analyses = await Promise.map(analysesOutput, uploadAnalyses)
	//save analyses to db
	const db = await DB.get()
	const results = await Promise.map(analyses, async analysis => {
		analysis = _.omit(analysis, 'filename')
		analysis = {
			...analysis,
			s3key: `${image.permalink}/${analysis.s3key}`,
			imageId: image.id
		}
		const existing = await db.collections.analysis.find({
			where: {
				imageId: image.id,
				type: analysis.type
			},
			sort: 'createdAt asc'
		})
		const saved = await db.collections.analysis.create(analysis)
		if( existing.length > 2 ) {
			existing[0].destroy()
		}
		return saved
	})
	//finalize
	return callback(null, results)
}
