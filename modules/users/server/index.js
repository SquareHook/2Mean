var Users = require('./models/Users');

/**
 * Controller Section.
 */
var UserCrudController = require('./controllers/user-crud.controller');
var UserProfileController = require('./controllers/user-profile.controller');
var UserAuthController = require('./controllers/user-auth.controller');

/**
 * Data Access Section.
 */
var UserCrudDAO = require('./dataAccess/user-crud.dao');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function User([logger, shared]) {
  let userCrudDAO = new UserCrudDAO(logger, shared);

  var userCrudController = new UserCrudController(logger, shared, userCrudDAO);
  var userProfileController = new UserProfileController(logger, shared);
  var userAuthController = new UserAuthController(logger, shared);

  return {
    crud: userCrudController,
    profile: userProfileController,
    auth: userAuthController
  };
};

module.exports = User;
