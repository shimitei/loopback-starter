'use strict';

const winston = require('winston');
const transports = require('./logger-transports');
const logger = new (winston.Logger)({
  transports: transports,
  exceptionHandlers: transports,
});

module.exports = logger;
