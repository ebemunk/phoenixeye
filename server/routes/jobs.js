var debug = require('debug')('server:routes:jobs');
var config = require('../config.json');

var mongoose = require('mongoose');

//router
var router = require('express').Router();

//model
var Job = require('../models/job.js');

//get a job by its id
router.get('/:id', function (req, res, next) {
	debug('/jobs/:id');

	//check that id given is a valid ObjectId
	if( ! mongoose.Types.ObjectId.isValid(req.params.id) ) {
		return res.status(400).json({error: 'invalid id'});
	}

	//try to get job by id
	Job.findOne(
		{
			_id: req.params.id
		},
		function (err, job) {
			//cry
			if( err )
				return res.status(500).json({error: err.message});

			//more tears
			if( ! job )
				return res.status(404).json({error: 'no job found with this id ' + req.params.id});

			//return job
			res.json({
				job: job
			});
		}
	);
});

module.exports = function() {
	return router;
}();