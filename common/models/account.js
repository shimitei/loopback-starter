'use strict';

module.exports = function(Account) {
  // Disable related accessTokens API
  Account.disableRemoteMethodByName('prototype.__count__accessTokens');
  Account.disableRemoteMethodByName('prototype.__create__accessTokens');
  Account.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Account.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Account.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Account.disableRemoteMethodByName('prototype.__get__accessTokens');
  Account.disableRemoteMethodByName('prototype.__updateById__accessTokens');

  // Remove existing validations for email
  delete Account.validations.email;

  const validUsername = /^[a-zA-Z0-9_\-]+$/;
  Account.validate('username',
    function(err) {
      if (this.username !== undefined
        && !validUsername.test(this.username)) err();
    },
    {message: 'VALIDATE_ERR_ACCOUNT_USERNAME_PATTERN'}
  );
};
