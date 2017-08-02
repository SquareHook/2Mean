const mongoose = require('mongoose');
const Roles = mongoose.model('Roles');

/**
 * @param {Object} logger
 * @param {Object} roleManager
 * @param {Object[]} routes
 */
function rolesInitHelper(logger, roleManager, routes) {
  /**
   * Creates initial application roles based on the passed tree
   * @param {Object} initialRoles - root of tree representing desired default roles
   * @param {string} initialRoles.name
   * @param {Object[]} initialRoles.children
   * @param {Object} initialRoles.children[] - a node in the tree
   * @param {Object[]} initialRoles.permissions
   * @param {string|null} parent
   */
  function createInitialRoles(initialRoles, parent=null) {
    let roleName = initialRoles.name;
    let children = initialRoles.children;
    let childNames = children.map((child) => { return child.name });
    
    return this.createInitialRole(roleName, parent, childNames, initialRoles.permissions).then(() => {
      let promises = [];

      if (children.length) {
        children.forEach((child) => {
          promises.push(this.createInitialRoles(child, roleName));
        });
      }

      return Promise.all(promises);
    }).catch((error) => {
      logger.error('Error creating initial roles');
      console.log(error);
    });
  }

  /**
   * determines if any of the expressions match the routeString
   */
  function containsMatch(routeString, expressions) {
    let match = false;

    for (let index = 0; index < expressions.length; index++) {
      let expression = expressions[index];

      if (expression.constructor.name === 'String') {
        match = match || expression === routeString;
      } else if (expression.constructor.name === 'RegExp') {
        match = match || expression.test(routeString);
      } else {
        throw new Error('Expression must be a string or RegExp');
      }

      if (match) {
        return match;
      }
    }

    return match;
  }

  /**
   * Determines if a route is allowed or forbidden based on the provided
   * list of forbid/allow expressions
   * The semantics are: FORBID all roles that are not explicitly allowed.
   *                    ALLOW any role matched by an element of the allow array
   *                ... unless it is also matched by an element of the forbid array
   *
   * @param {Object} route
   * @param {string} route.type
   * @param {string} route.route
   * @param {string|regexp} permissions[].allow[] - a <TYPE><ROUTE> expression to allow
   * @param {string|regexp} permissions[].forbid[] - a <TYPE><ROUTE> exporession to not allow
   */
  function isRouteAllowed(route, allow, forbid) {
    let routeString = route.type + route.route;

    let allowedExplicitly = this.containsMatch(routeString, allow);
    let forbiddenExplicitly = this.containsMatch(routeString, forbid);

    return allowedExplicitly && !forbiddenExplicitly;
  }

  /**
   * Creates an initial role if it does not already exist in the db.
   * Adding default permissions can be done by providing the fourth parameter.
   * @summary Creates an initial role if it does not already exist on app start
   * @param {string} roleName
   * @param {string} roleName

   * @param {string[]=[]} subRoles
   * @param {Object[]=[]} permissions
   * @param {string} permissions[].module - the name of the module
   * @param {Array} permissions[].allow - a list of <TYPE><ROUTE> expressions to allow
   * @param {Array} permissions[].forbid - a list of <TYPE><ROUTE> exporessions to not allow
   */
  function createInitialRole(roleName, parentName, subroles=[], permissions=[]) {
    let allowedRoutes = [];

    for (let permissionsIndex = 0; permissionsIndex < permissions.length; permissionsIndex++) {
      let moduleName = permissions[permissionsIndex].module;
      let allow = permissions[permissionsIndex].allow;
      let forbid = permissions[permissionsIndex].forbid;

      if (routes[moduleName]) {
        // great now check this list for allowed routes
        let moduleRoutes = routes[moduleName];

        for (let routeIndex = 0; routeIndex < moduleRoutes.length; routeIndex++) {
          if (this.isRouteAllowed(moduleRoutes[routeIndex], allow, forbid)) {
            allowedRoutes.push({
              asset: roleManager.getEndpointHash(roleManager.pruneEndpointDetails(moduleRoutes[routeIndex]))
            });
          }
        }
      } else {
        throw new Error('Module \'' + moduleName +'\' does not exist');
      }
    }

    return Roles.count({ _id: roleName, parent: parentName }).exec().then((count) => {
      if (count < 1) {
        let newRole = new Roles({
          _id: roleName,
          parent: parentName,
          canModify: false,
          subroles: subroles,
          permissions: allowedRoutes
        });

        return newRole.save().then((savedRole) => {
          logger.info('Created ' + roleName + ' role');
        });
      }
    }).catch((error) => {
      logger.error('Failed to create ' + roleName + ' role');
    });
  }

  // --------------------------- Revealing Module Section ----------------------------

  return {
    createInitialRoles        : createInitialRoles,
    createInitialRole         : createInitialRole,
    containsMatch             : containsMatch,
    isRouteAllowed            : isRouteAllowed
  }
}

module.exports = rolesInitHelper;
