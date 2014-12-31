var mongoose = require('mongoose');

//Image model schema
module.exports = mongoose.Schema(
	{
		//initial submission
		originalFileName: String,
		url: String,
		fileName: String,
		path: String,
		fileSize: Number,
		type: String,
		md5: String,
		size: {
			width: Number,
			height: Number
		},
		permalink: String,
		uploaderIP: String,
		metaComplete: Boolean,

		//imagemagick
		depth: {},
		imageStatistics: {},
		channelStatistics: {},
		gamma: String,
		chromaticity: {},

		//exiv2
		exif: {},
		iptc: {},
		xmp: {},

		//phoenix
		hackerfactorQuality: Number,
		imagemagickQuality: Number,
		qtables: {},

		//meta
		created: Date,
		updated: Date
	},
	{
		versionKey: false
	}
);