'use strict';

require('./migration')('automigrate', function(err) {
  process.exit();
});
