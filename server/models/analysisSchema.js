var mongoose = require('mongoose');

var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');

//Analysis model schema
var schema = mongoose.Schema(
	{
		//data
		imageId: mongoose.Schema.Types.ObjectId,
		type: String,
		fileName: String,
		path: String,
		params: {},

		//meta
		requesterIP: String,
		created: Date
	},
	{
		versionKey: false
	}
);

//pre-save hook
schema.pre('save', function (next) {
	this.created = this.created || new Date();
	next();
});

//post remove: delete file on disk after removal
schema.post('remove', function (doc) {
	fs.unlink(path.join(appRoot.toString(), doc.path, doc.fileName));
});

//transform before converting to obj or json
var transform = function(doc, ret, options) {
	ret.path = ret.path.replace(/\\/g, '/');

	return ret;
}

schema.set('toJSON', {
	transform: transform
});

schema.set('toObject', {
	transform: transform
});

module.exports = schema;