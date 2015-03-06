var mongoose = require('mongoose');

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

module.exports = schema;