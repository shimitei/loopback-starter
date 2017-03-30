'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());

  // For development router
  if (process.env.NODE_ENV == 'development') {
    require('../../test/router/')(server, router);
  }

  server.use(router);
};
