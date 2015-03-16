var debug = require('debug')('server:models:analysis');

var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');
var appRoot = require('app-root-path');

var Analysis = mongoose.model('Analysis', require('./analysisSchema.js'));

//want access to the actual remove() method
Analysis.prototype.remove_base = Analysis.prototype.remove;

//override remove func to also delete the file in disk
Analysis.prototype.remove = function(callback) {
	debug('Analysis.prototype.remove');

	fs.unlink(path.join(appRoot.toString(), this.path, this.fileName));
	this.remove_base();
};

module.exports = Analysis;