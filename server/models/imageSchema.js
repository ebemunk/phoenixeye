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

//transform before converting to obj or json
var transform = function(doc, ret, options) {
	var doNotReturn = [
		'uploaderIP'
	];

	doNotReturn.forEach(function (key) {
		delete ret[key];
	});

	var qtables = {};
	for( var tableIndex in ret.qtables ) {
		qtables[tableIndex] = [];

		var qt = ret.qtables[tableIndex].split(',');
		while( qt.length ) {
			qtables[tableIndex].push(qt.splice(0,8));
		}
	}

	ret.qtables = qtables;

	if( ret.path ) {
		ret.path = ret.path.replace(/\\/g, '/');
	}

	return ret;
}

schema.set('toJSON', {
	transform: transform
});

schema.set('toObject', {
	transform: transform
});

module.exports = schema;