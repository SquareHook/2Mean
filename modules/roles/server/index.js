var Roles = require('./models/Roles');
var RolesController = require('./controllers/roles.controller');
var path = require("path");
var Users = path.resolve("modules/users/server/models/Users");

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function RolesModule([logger, userModule, roles], moduleLoader) {
  var rolesController = new RolesController(logger, userModule, moduleLoader);

  return rolesController;
};

module.exports = RolesModule;
