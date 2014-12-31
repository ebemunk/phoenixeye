var mongoose = require('mongoose');

//Job model schema
module.exports = mongoose.Schema(
	{
		name: String,
		params: {},
		queue: String,
		attempts: Number,
		timeout: Number,
		delay: Date,
		priority: Number,
		status: String,
		enqueued: Date
	},
	{
		versionKey: false
	}
);