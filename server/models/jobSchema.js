var mongoose = require('mongoose');

//Job model schema
var schema = mongoose.Schema(
	{
		name: String,
		params: {},
		queue: String,
		attempts: Number,
		timeout: Number,
		delay: Date,
		priority: Number,
		status: String,
		enqueued: Date,
		dequeued: Date,
		ended: Date,
		error: String,
		stack: String
	},
	{
		versionKey: false
	}
);

//disable returning sensitive attributes
schema.set('toJSON', {
	transform: function(doc, ret, options) {
		if( ret.params && ret.params.hasOwnProperty('requesterIP') ) {
			delete ret.params.requesterIP;
		}

		return ret;
	}
});

module.exports = schema;