var debug = require('debug')('server:models:analysis');

var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');
var appRoot = require('app-root-path');

var Analysis = mongoose.model('Analysis', require('./analysisSchema.js'));

module.exports = Analysis;