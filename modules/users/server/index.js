var Users = require('./models/Users');

var UserCrudController = require('./controllers/user-crud.controller');
var UserProfileController = require('./controllers/user-profile.controller');
var UserAuthController = require('./controllers/user-auth.controller');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function User([logger, shared]) {
  var userCrudController = new UserCrudController(logger, shared);
  var userProfileController = new UserProfileController(logger, shared);
  var userAuthController = new UserAuthController(logger, shared);

  return {
    crud: userCrudController,
    profile: userProfileController,
    auth: userAuthController
  };
};

module.exports = User;
