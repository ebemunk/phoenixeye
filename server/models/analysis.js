var debug = require('debug')('server:models:analysis');
var mongoose = require('mongoose');

var Analysis = mongoose.model('Analysis', require('./analysisSchema.js'));
module.exports = Analysis;