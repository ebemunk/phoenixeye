import debug from 'debug'
import Waterline from 'waterline'

//eslint-disable-next-line no-unused-vars
const log = debug('Image')

let Image = {
	identity: 'image',
	tableName: 'images',
	connection: 'default',
	migrate: 'safe',

	attributes: {
		//initial submission
		originalFileName: 'string',
		originalUrl: 'string',
		url: 'string',
		size: 'integer',
		type: 'string',
		md5: 'string',
		dims: 'json',
		permalink: 'string',
		uploaderIP: 'string',
		metaComplete: 'boolean',

		//imagemagick
		depth: 'json',
		imageStatistics: 'json',
		channelStatistics: 'json',
		gamma: 'string',
		chromaticity: 'json',

		//exiv2
		exif: 'json',
		iptc: 'json',
		xmp: 'json',

		//phoenix
		hackerfactorQuality: 'float',
		imagemagickQuality: 'float',
		qtables: 'json',

		analyses: {
			collection: 'analysis',
			via: 'image'
		},

		//default instance overrides
		toJSON: function () {
			let obj = this.toObject()
			let doNotReturn = [
				'uploaderIP'
			]
			doNotReturn.forEach(function (key) {
				delete obj[key]
			})
			let qtables = {}
			for( let tableIndex in obj.qtables ) {
				qtables[tableIndex] = []
				let qt = obj.qtables[tableIndex].split(',')
				while( qt.length ) {
					qtables[tableIndex].push(qt.splice(0,8))
				}
			}
			obj.qtables = qtables
			return obj
		}
	}
}

export default Waterline.Collection.extend(Image)
