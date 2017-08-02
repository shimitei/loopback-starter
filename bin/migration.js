'use strict';
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const logger = require(path.resolve(__dirname, '../server/logger/logger'));
const ds = app.dataSources.psql;
const async = require('async');
const fs = require('fs');
/*
 * suppress warning
 * https://github.com/strongloop/loopback/issues/1186
 */
ds.setMaxListeners(0);

module.exports = main;

/**
 * entry point
 * @param {*} mode 'autoupdate' or 'automigrate'
 * @param {*} next callback
 */
function main(mode, next) {
  if (mode === 'autoupdate') {
    migration(autoupdate, next);
  } else if (mode === 'automigrate') {
    migration(automigrate, next);
  }
}

function migration(execFunction, next) {
  async.waterfall([
    execFunction,
    execSQL,
  ], function(err, result) {
    if (err) logger.error(err);
    next(err);
  });
}

function getModels(dataSource = 'postgresql') {
  const result = [];
  for (let key in app.models) {
    if (app.models[key].getDataSource().name === dataSource) {
      result.push(key);
    }
  }
  return result;
}

function autoupdate(next) {
  logger.info('Start autoupdate...');
  ds.autoupdate(getModels(), function(err) {
    logger.info('autoupdate done!');
    next(err);
  });
}

function automigrate(next) {
  logger.info('Start automigrate...');
  ds.automigrate(getModels(), function(err) {
    logger.info('automigrate done!');
    next(err);
  });
}

function execSQL(next) {
  const filepath = path.resolve(__dirname, 'migration.sql');
  if (fs.existsSync(filepath)) {
    const sql = fs.readFileSync(filepath, 'utf8');
    logger.debug('sql', sql);
    ds.connector.execute(sql, null, (err, resultObjects) => {
      next(err);
    });
  } else {
    next();
  }
}
