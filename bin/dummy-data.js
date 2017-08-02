'use strict';
const env = process.env.NODE_ENV || 'development';
if (env != 'development') {
  process.exit();
}
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const logger = require(path.resolve(__dirname, '../server/logger/logger'));
const ds = app.dataSources.psql;
const async = require('async');

async.waterfall([
  failsafe,
  createAdmin,
], function(err, result) {
  if (err) logger.error(err);
  else logger.info('Done!');
  ds.disconnect();
  process.exit();
});

function failsafe(callback) {
  app.models.RoleGroup.count(function(err, count) {
    if (err) return callback(err);
    if (count === 0) {
      return callback();
    }
    return callback(new Error('Data already exists!'));
  });
}

function createAdmin(callback) {
  app.models.RoleGroup.create([
    {
      name: 'admin',
      roleAdmin: true,
      roleUser: true,
    },
  ], function(err, groups) {
    if (err) return callback(err);
    logger.info('Created RoleGroup:', groups);

    app.models.Account.create([
      {username: 'admin', name: 'ADMIN', password: 'admin', roleGroupId: 1},
    ], function(err, users) {
      if (err) return callback(err);
      logger.info('Created Account:\n', users);
      return callback();
    });
  });
}
