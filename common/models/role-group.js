'use strict';

module.exports = function(RoleGroup) {
  RoleGroup.observe('before delete', function(ctx, next) {
    if (ctx.where.id == 1) {
      // Stop delete
      const err = new Error('ERROR_ROLEGROUP_DELETE_ADMIN');
      err.statusCode = 403;
      next(err);
    } else {
      next();
    }
  });
};
