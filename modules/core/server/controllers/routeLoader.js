var _ = require('lodash');

function routeLoader(logger, modLoader, app, roles) {
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

        // If the route we're adding is a secured route.
        if (route.secure) {
          // and the role manager is enabled.
          if (roles.isEnabled()) {
              app[route.type.toLowerCase()](
                // The route URI
                '/API' + route.route,
                // Auth module check
                auth.validateAPIKey,
                // Roles policy check.
                (req, res, next) => {
                  // This has to be instanced to keep track of the endpoint hash.
                  roles.validateAccess(
                      roles.getEndpointHash(roles.pruneEndpointDetails(route)),
                      req.user.role
                    ).then((policyAllowed) => {
                      if (policyAllowed) {
                        next();
                        return;
                      } else {
                        return res.status(403).send({error: 'Role does not have permission to access this resource'});
                      }
                    });
                },
                // Actual function to handle request.
                targetFunction
              );
          } else {
            // Role manager disabled.
            app[route.type.toLowerCase()](
                '/API' + route.route,
                auth.validateAPIKey,
                targetFunction
              );
          }
        } else {
          // Unsecured Endpoint.
          app[route.type.toLowerCase()](
              '/API' + route.route,
              targetFunction
            );
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
      logger.error('ERROR: Server Module defined a route that uses a undefined method.', methodName);

      throw 'Specified Function does not exists: ' + methodName
    }

    if(methodSegments.length === 1) {
      return mod[methodName];
    }

    return findTargetFunction(_.join(methodSegments.slice(1), '.'),  mod[methodSegments[0]]);
  }

  return {
    loadRoutes: loadRoutes
  }
}

module.exports = routeLoader;
