import _ from 'lodash'
import Promise from 'bluebird'
import debug from 'debug'

const log = debug('cli:services:gps')

let DI

export default class GPSService {
	static $inject = [
		'$http',
	]

	constructor() {
		DI = _.zipObject(GPSService.$inject, [...arguments])
	}

	getCoords(gpsInfo) {
		if( ! gpsInfo.GPSLatitude || ! gpsInfo.GPSLatitudeRef || ! gpsInfo.GPSLongitude || ! gpsInfo.GPSLongitudeRef )
			return false
		const lat = DMStoDD(gpsInfo.GPSLatitude, gpsInfo.GPSLatitudeRef)
		const lng = DMStoDD(gpsInfo.GPSLongitude, gpsInfo.GPSLongitudeRef)
		return {
			lat,
			lng
		}
	}
}

function DMStoDD(gpsString, gpsDirection) {
	const parts = gpsString.split(' ')
	const deg = parseFloat(parts[0].replace('deg', '').replace('°', '')) || 0
	const min = parseFloat(parts[1]) || 0
	const sec = parseFloat(parts[2]) || 0
	gpsDirection = gpsDirection || parts[3]
	log('gps: deg, min, sec, direction', deg, min, sec, gpsDirection)
	let dd = deg + min/60 + sec/3600
	if( gpsDirection ) {
		gpsDirection = gpsDirection[0].toLowerCase()
		if( gpsDirection == 's' || gpsDirection == 'w' ) {
			dd *= -1
		}
	}
	log('gps dd', dd)
	return dd
}
