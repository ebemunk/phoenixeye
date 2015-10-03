var config = require('../config.json');

config.env = process.env.ENV || config.env;
config.port = process.env.PORT || config.port;
config.dbString = process.env.DB_STRING || config.dbString;
config.bin.phoenix = process.env.BIN_PHOENIX || config.bin.phoenix;
config.rollbar.serverToken = process.env.ROLLBAR_SERVER_TOKEN || config.rollbar.serverToken;
config.rollbar.clientToken = process.env.ROLLBAR_CLIENT_TOKEN || config.rollbar.clientToken;

module.exports = config;