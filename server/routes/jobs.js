var debug = require('debug')('server:routes:jobs');

var router = require('express').Router();

var HTTPError = require('node-http-error');

//get job
router.get('/:jobId', function (req, res, next) {
	debug('/jobs/:jobId');

	req.app.models.job.findOne({
		id: req.params.jobId
	})
	.then(function (job) {
		if( ! job ) {
			throw new HTTPError(404, 'no job found with this id');
		}

		return res.json({
			job: job
		});
	})
	.catch(function (err) {
		return next(err);
	});
});

module.exports = router;