var Users = require('../../users/server/models/Users');

var Keys = require('./models/Keys');


/**
 * The functionality of the Authentication module.
 */
var AuthModule = require('./controllers/auth');


/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Auth([logger, shared]) {
  var AuthController = new AuthModule(logger, shared);

  return AuthController;
};

module.exports = Auth;
