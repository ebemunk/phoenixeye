import debug from 'debug'
import Promise from 'bluebird'
import dataobjectParser from 'dataobject-parser'
import gm from 'gm'
gm.subClass({imageMagick: true})

const exec = Promise.promisify(require('child_process').exec)
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

export default {
	getGMInfo,
	getExiv2Info
}
