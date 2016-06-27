import debug from 'debug'
import Promise from 'bluebird'

import appConfig from '../appConfig'
import DB from './DB'

const S3 = Promise.promisifyAll(require('./S3').default)
const fs = Promise.promisifyAll(require('fs'))
const log = debug('handleJob')
const wtf = getJobCmd

//construct job string (command call) from parameters
function getJobCmd(params, path) {
	let command = `${appConfig.bin.phoenix} -f ${path} -o ${path} -json`
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

export async function handleJob(params, callback) {
	console.log('\n\nyayaya', params);
	log('handleJob', params)
	//get image from db
	// const db = await DB.get()
	// const image = await db.collections.image.findOne({
	// 	id: params.imageId
	// })
	// if( ! image ) {
	// 	return callback(new Error(`no image found with id: ${params.imageId}`))
	// }
	//download from s3
	const file = await S3.getObjectAsync({
		Bucket: appConfig.aws.bucket,
		Key: 'B1bFjWcpB/B1bFjWcpB.jpg'//image.s3key
	})
	const path = 'tmp/' + Date.now().toString() + '_' + Math.random().toString()
	await fs.writeFileAsync(path, file.Body)
	//run cmd
	const cmd = getJobCmd(params, path)
	console.log('yea', cmd);
	return callback(null, {hi: ':)'})
		// 	return Promise.fromNode(function (callback) {
		// 		return child_process.exec(jobString, callback)
		// 	})
		// })
		// .spread(function (stdout, stderr) {
		// 	return Promise.try(function () {
		// 		return JSON.parse(stdout)
		// 	})
		// })
		// .then(function (jsonOutput) {
		// 	output = jsonOutput
		//
		// 	//save estimates & qtables if available
		// 	image.imagemagickQuality = output.imagick_estimate || image.imagick_estimate || null
		// 	image.hackerfactorQuality = output.hf_estimate || image.hf_estimate || null
		// 	image.qtables = output.qtables || image.qtables || null
		// 	return image.save()
		// })
		// .then(function (img) {
		// 	image = img
		//
		// 	//remove img meta from output
		// 	delete output.hf_estimate
		// 	delete output.imagick_estimate
		// 	delete output.qtables
		//
		// 	return self.saveAnalyses(image.id, output)
		// })
		// .catch(function (err) {
		// 	debug('error in job', err)
		// 	throw err
		// })
		// .nodeify(callback)
}
