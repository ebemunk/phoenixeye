var mongoose = require('mongoose');

//Analysis model schema
module.exports = mongoose.Schema(
	{
		//data
		imageId: mongoose.Schema.Types.ObjectId,
		type: String,
		fileName: String,
		path: String,
		params: {},

		//meta
		requesterIP: String,
		created: Date,
		updated: Date
	},
	{
		versionKey: false
	}
);