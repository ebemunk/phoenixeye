var config = require('../config.json');

config.port = process.env.PORT || config.port;
config.dbString = process.env.DB_STRING || config.dbString;
config.bin.phoenix = process.env.BIN_PHOENIX || config.bin.phoenix;

module.exports = config;