var _ = require('lodash');

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
        var targetFunction = findTargetFunction(route.method, modLoader.get(mod));


        if (route.type.toUpperCase() === 'GET') {
          if (route.secure) {
            app.get(
              '/API' + route.route,
              auth.validateAPIKey,
              targetFunction
            );
          } else {
            app.get(
              '/API' + route.route,
              targetFunction
            );
          }
        } else if (route.type.toUpperCase() === 'POST') {
          if (route.secure) {
            app.post(
              '/API' + route.route,
              auth.validateAPIKey,
              targetFunction
            );
          } else {
            app.post(
              '/API' + route.route,
              targetFunction
            );
          }
        } else if (route.type.toUpperCase() === 'PUT') {
          if (route.secure) {
            app.put(
              '/API' + route.route,
              auth.validateAPIKey,
              targetFunction
            );
          } else {
            app.put(
              '/API' + route.route,
              targetFunction
            );
          }
        } else if (route.type.toUpperCase() === 'DELETE') {
          if (route.secure) {
            app.delete(
              '/API' + route.route,
              auth.validateAPIKey,
              targetFunction
            );
          } else {
            app.delete(
              '/API' + route.route,
              targetFunction
            );
          }
        }
      });
    }
  }

  /**
   * Finds the method that corresponds to string provided.
   *
   * @param {string} methodName The dot separated drill down for the method to look for.
   * @param {Object} mod        The module to look in for the function specified.
   *
   * @throws {Exception} If the specified function does not exist an exception is thrown.
   *
   * @return {Function} The function that was asked for.
   */
  function findTargetFunction(methodName, mod) {
    var methodSegments = methodName.split('.');

    if (!mod[methodSegments[0]]) {
      logger.crit('ERROR: Server Module defined a route that uses a undefined method.', methodName);

      throw 'Specified Function does not exists: ' + methodName
    }

    if(methodSegments.length === 1) {
      return mod[methodName];
    }

    return findTargetFunction(_.join(methodSegments, '.'),  mod[methodSegments[0]]);
  }

  return {
    loadRoutes: loadRoutes
  }
}

module.exports = routeLoader;
