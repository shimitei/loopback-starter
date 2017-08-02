'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  const router = server.loopback.Router();
  router.get('/', server.loopback.status());

  // For development router
  const env = process.env.NODE_ENV || 'development';
  if (env == 'development') {
    require('../../test/router/')(server, router);
  }

  // server/router/index.js
  require('../router/')(server, router);

  server.use(require('../logger/access-logger'));
  server.use(router);
  server.use(require('../logger/error-logger'));
};
