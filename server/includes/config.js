var config = require('../config.json');

config.env = process.env.ENV || config.env;
config.port = process.env.PORT || config.port;
config.dbString = process.env.DB_STRING || config.dbString;
config.bin.phoenix = process.env.BIN_PHOENIX || config.bin.phoenix;

config.analytics.rollbar.serverToken = process.env.ROLLBAR_SERVER_TOKEN || config.analytics.rollbar.serverToken;
config.analytics.rollbar.clientToken = process.env.ROLLBAR_CLIENT_TOKEN || config.analytics.rollbar.clientToken;
config.analytics.google.id = process.env.GOOGLE_ANALYTICS_ID || config.analytics.google.id;
config.analytics.heap.id = process.env.HEAP_ANALYTICS_ID || config.analytics.heap.id;

module.exports = config;