function routeLoader(logger, modLoader, app) {
  var routes = [];

  constructor();

  function constructor() {}

  function loadRoutes() {
    var routeList = modLoader.getRoutes();
    var auth = modLoader.get('auth');

    // A little unwieldy, but functional.
    // Couldn't find the express function that used to exist where you can define the method in the function call.
    for (var mod in routeList) {

      routeList[mod].forEach((route) => {
        if (route.type.toUpperCase() === 'GET') {
          if (route.secure) {
            app.get(
              '/API' + route.route,
              auth.validateAPIKey,
              modLoader.get(mod)[route.method]
            );
          } else {
            app.get(
              '/API' + route.route,
              modLoader.get(mod)[route.method]
            );
          }
        } else if (route.type.toUpperCase() === 'POST') {
          if (route.secure) {
            app.post(
              '/API' + route.route,
              auth.validateAPIKey,
              modLoader.get(mod)[route.method]
            );
          } else {
            app.post(
              '/API' + route.route,
              modLoader.get(mod)[route.method]
            );
          }
        } else if (route.type.toUpperCase() === 'PUT') {
          if (route.secure) {
            app.put(
              '/API' + route.route,
              auth.validateAPIKey,
              modLoader.get(mod)[route.method]
            );
          } else {
            app.put(
              '/API' + route.route,
              modLoader.get(mod)[route.method]
            );
          }
        } else if (route.type.toUpperCase() === 'DELETE') {
          if (route.secure) {
            app.delete(
              '/API' + route.route,
              auth.validateAPIKey,
              modLoader.get(mod)[route.method]
            );
          } else {
            app.delete(
              '/API' + route.route,
              modLoader.get(mod)[route.method]
            );
          }
        }
      });
    }
  }

  return {
    loadRoutes: loadRoutes
  }
}

module.exports = routeLoader;
