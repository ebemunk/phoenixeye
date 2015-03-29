var debug = require('debug')('server:routes:analyses');
var config = require('../config.json');

//router
var router = require('express').Router();

var appRoot = require('app-root-path');

//model
var Analysis = require('../models/analysis.js');

//get analyses by their imageId
router.get('/:imageId', function (req, res, next) {
	debug('/analyses/:imageId');

	//try to get analyses by imageId
	Analysis.find(
		{
			imageId: req.params.imageId
		},
		function (err, analyses) {
			//cry
			if( err )
				return res.status(500).json({error: err.message});

			//more tears
			if( ! analyses )
				return res.status(200).json({error: 'no analyses found for this image id ' + req.params.id});

			//return analyses
			res.json({
				analyses: analyses
			});
		}
	);
});

module.exports = function() {
	return router;
}();