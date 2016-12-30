var Users = require('./models/Users');

var Keys = require('./models/Keys');

/**
 * The functionality of the Authentication module.
 */
var AuthModule = require('./controllers/auth');


/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Auth(logger) {
  var AuthController = new AuthModule(logger);

  return AuthController;
};

module.exports = Auth;
