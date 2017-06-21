var moduleLoader = require('./controllers/moduleLoader');

var routeLoader = require('./controllers/routeLoader');

var Roles = require('../../roles/server/models/Roles');

var rolesManager = require('../../roles/server/controllers/role-manager.controller');

function coreModule(config, app) {
  var modLoader = new moduleLoader(config);

  var roles = new rolesManager(modLoader.get('logger'));

  // Circular dependency.
  modLoader.setRoles(roles);

  var routes = new routeLoader(modLoader.get('logger'), modLoader, app, roles);

  return {
    moduleLoader: modLoader,
    routes: routes
  }
}

module.exports = coreModule;
