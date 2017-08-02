'use strict';

require('./migration')('autoupdate', function(err) {
  process.exit();
});
