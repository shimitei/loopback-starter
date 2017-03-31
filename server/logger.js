'use strict';

const winston = require('winston');
const config = require('config');
const fluentTransport = require('fluent-logger').support.winstonTransport();
const transports = [new fluentTransport(config.fluentTag, config.fluent)];
const env = process.env.NODE_ENV || 'development';
if (env == 'development') {
  transports.push(new (winston.transports.Console)({level: 'debug', colorize: true}));
}
const logger = new (winston.Logger)({
    transports: transports,
    exceptionHandlers: transports
});

module.exports = logger;
