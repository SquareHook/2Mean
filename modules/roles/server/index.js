var Roles = require('./models/Roles');
var RolesController = require('./controllers/roles.controller.js');


/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Roles([logger]) {
  var rolesController = new RolesController(logger);

  return rolesController;
};

module.exports = Roles;
