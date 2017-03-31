'use strict';

const expressWinston = require('express-winston');
const transports = require('./logger-transports');

const logger = expressWinston.errorLogger({
  transports: transports,
});

module.exports = logger;
