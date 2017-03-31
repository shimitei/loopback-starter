'use strict';

module.exports = function(app) {
  const roleResolver = function(role, context, cb) {
    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }

    const userId = context.accessToken.userId;
    if (!userId) return reject();

    app.models.Account.findById(userId, function(err, user) {
      if (err || !user) return reject();

      app.models.RoleGroup.findById(user.roleGroupId, function(err, group) {
        if (err || !group) return reject();

        if (group.roleAdmin) cb(null, true);
        else cb(null, Boolean(group[role]));
      });
    });
  };

  const Role = app.models.Role;
  Role.registerResolver('roleUser', roleResolver);
};
