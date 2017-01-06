var moduleLoader = require('./controllers/moduleLoader');

var routeLoader = require('./controllers/routeLoader');

function coreModule(config, app) {
  var modLoader = new moduleLoader(config);

  var routes = new routeLoader(modLoader.get('logger'), modLoader, app);

  return {
    moduleLoader: modLoader,
    routes: routes
  }
}

module.exports = coreModule;
