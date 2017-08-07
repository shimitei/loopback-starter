'use strict';

const logger = require('../../server/logger/logger');
const PdfUtil = require('../../common/util/pdf-util');
module.exports = function(app, router) {
  // http://localhost:3000/test/a4
  router.get('/test/a4', function(req, res) {
    res.render('a4', {
      list: ['first page', 'second page', 'third page'],
    });
  });
  // http://localhost:3000/test/a4pdf
  router.get('/test/a4pdf', function(req, res) {
    try {
      const url = 'http://localhost:' + app.settings.port
        + '/test/a4';
      PdfUtil.downloadAsPdf(url, res);
    } catch (err) {
      logger.error(err);
      res.status(err.status || 500);
      res.end();
    }
  });
};
