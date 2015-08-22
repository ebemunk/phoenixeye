var debug = require('debug')('server:routes:analyses');
var config = require('../config.json');

var router = require('express').Router();

var HTTPError = require('node-http-error');

//get analyses by their imageId
router.get('/:imageId', function (req, res, next) {
	debug('/analyses/:imageId');

	//try to get analyses by imageId
	req.app.models.analysis.find({
		imageId: req.params.imageId
	})
	.then(function (analyses) {
		//return analyses
		return res.json(analyses);
	})
	.catch(function (err) {
		return next(err);
	});
});

module.exports = router;