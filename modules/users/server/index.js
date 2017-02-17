var Users = require('./models/Users');

var UserCrudController = require('./controllers/user-crud.controller');
var UserProfileController = require('./controllers/user-profile.controller');
var UserAuthController = require('./controllers/user-auth.controller');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function User([logger]) {
  var userCrudController = new UserCrudController(logger);
  var userProfileController = new UserProfileController(logger);
  var userAuthController = new UserAuthController(logger);

  return {
    crud: userCrudController,
    profile: userProfileController,
    auth: userAuthController
  };
};

module.exports = User;
