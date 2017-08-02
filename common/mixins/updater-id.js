'use strict';

module.exports = function(Model, options) {
  const isSystemUser = function() {
    const env = process.env.NODE_ENV || 'development';
    return (env === 'development');
  }();

  Model.defineProperty('updaterId', {type: Number});

  Model.observe('before save', function event(ctx, next) {
    let userId;
    const at = ctx.options.accessToken;
    if (at) {
      userId = at.userId;
    } else if (isSystemUser) {
      userId = 1;
    }
    if (userId) {
      if (ctx.instance) {
        ctx.instance.updaterId = userId;
      } else {
        ctx.data.updaterId = userId;
      }
    }
    next();
  });
};
