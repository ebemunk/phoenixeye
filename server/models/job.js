var debug = require('debug')('server:models:job');
var mongoose = require('mongoose');

var Job = mongoose.model('Job', require('./jobSchema.js'));
module.exports = Job;