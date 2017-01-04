var Users = require('./models/Users');

var UserController = require('./controllers/user.controller');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function User(logger) {
  var userController = new UserController(logger);

  return userController;
};

module.exports = User;
