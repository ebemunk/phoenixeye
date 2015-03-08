var mongoose = require('mongoose');

//Image model schema
var schema = mongoose.Schema(
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

//pre-save hook
schema.pre('save', function (next) {
	this.created = this.created || new Date();
	this.updated = new Date();
	next();
});

//disable returning sensitive attributes
var hideFields = function(doc, ret, options) {
	var doNotReturn = [
		'uploaderIP'
	];

	doNotReturn.forEach(function (key) {
		delete ret[key];
	});

	return ret;
}

schema.set('toJSON', {
	transform: hideFields
});

schema.set('toObject', {
	transform: hideFields
});

module.exports = schema;