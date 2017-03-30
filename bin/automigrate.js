'use strict';
const path = require('path');
const app = require(path.resolve(__dirname, '../server/server'));
const ds = app.dataSources.psql;
/*
 * suppress warning
 * https://github.com/strongloop/loopback/issues/1186
 */
ds.setMaxListeners(0);

const Models = function() {
  const result = [];
  for (var key in app.models) {
    if (app.models[key].getDataSource().name === 'postgresql') {
      result.push(key);
    }
  }
  return result;
}();

ds.automigrate(Models, function(err) {
  if (err) {
    console.error('ERROR automigrate:', err);
    throw err;
  }

  app.models.Account.create([
    {username: 'admin', name: 'ADMIN', password: 'admin'},
  ], function(err, users) {
    if (err) {
      console.log('ERROR Account create:', err);
      throw err;
    }

    console.log('Created Account:\n', users);
    ds.disconnect();
  });
});
