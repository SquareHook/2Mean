/*
 * Roles Controller
 * Provices andvanced role functionality and API endpoints
 */

// ---------------------------- Imports ----------------------------
var q = require('q');
var mongoose = require('mongoose');
//use q promise lib for mongoose promises
mongoose.Promise = require('q').Promise;
var Roles = mongoose.model('Roles');
var path = require('path');
var config = require(path.resolve('config/config'));
var _ = require('lodash');


// ---------------------------- Module Definition ----------------------------
function roleModule(logger, userModule) {

  /*
   * check to make sure there exists an admin role with parent set to null
   * if one doesn't exist, create it.
   */
  var adminCount = Roles.count({
    _id: 'admin',
    parent: null
  }, (err, count) => 
  {
    if (count < 1) {
      var role = new Roles();
      role._id = 'admin';
      role.parent = null;
      role.save((err, data) => {
        if (err) {
          logger.error("Failed to create default admin role", err);
        }
      });
    }
  });


  /*
   * Roles can be added to the role tree at any level other than root.
   * When a role is added, the tree is traversed, and for each 'parent'
   * the role has, any users with role equal to that parent role will 
   * get the new role in their subroles array.
   * 
   * @param {req}  The Express HTTP request with the role in the body
   * @param {res} The Express HTTP response object
   * @param {next} The Express HTTP next function
   *
   * @return {bool} whether or not the role was added
   */
  function addRole(req, res, next) {
    var role = req.body;
    //make sure the role is valid
    if (role._id != null) {
      var addedRole = new Roles();
      addedRole._id = role._id;
      addedRole.parent = role.parent || null;
      role.canModify = role.canModify || false;
      role.parentForDescendants = role.parentForDescendants || [];

      //check to make sure the parent exists
      if (addedRole.parent === null || !roleExists(addedRole.parent)) {
        res.status(500).send("Parent must be a valid role");
        return;
      }


      //save will fail if _id isn't unique
      addedRole.save((err, data) => {
        if (err) {
          res.status(500).send("There is already a role with that name");
          return;
        } else {
          //the role was inserted into the roles collection
          //now we need to update the parent of the direct descendants
          //if there are any
          if (role.parentForDescendants && role.parentForDescendants.length > 0) {
            //in this case we are inserting a role above one or more existing roles
            _.forEach(role.parentForDescendants, function(node) {
              //we set that descendant's parent to this role._id
              updateParentForRole(node, role._id);
            });
          }

          Roles.find({}).then((data) => {

            //update the parent roles' subroles
            var parent = _.find(data, '_id', role.parent);
            logger.info("parent before loop: " + parent);

            while (parent !== null) {
              var subroles = getRolesByParent(parent._id, data, []);
              logger.info("subroles: " + subroles);
              userModule.flushSubroles(parent._id, subroles);
              parent = _.find(data, '_id', parent.parent);
              logger.info("parent in loop: " + parent);
            }

            res.status(201).send("Inserted role\n");
            return;
          });
        }
      });
    } else {
      res.status(500).send("Validation does not pass");
      return;
    }
  }
  
  /*
   * Returns an unordered list of subroles for a given role
   * 
   * @param {targetRole} the role to get subroles for
   * @return [Role] a list of subroles (if any)
   */
  function getSubroles(req, res, next) {
    if(!req.params.id)
    {
      req.status(500).send("No role id provided");
    }  

    getAllRoles()
    .then((data) => {
      var list = getRolesByParent(req.params.id, data, []);
      req.status(200).send(list);
    })
    .catch(err)
    {
      logger.error("error updating parent for role", err);
      req.status(500).send("Internal Server Error");
    });
  }
  /*
   * Roles can be added to the role tree at any level other than root.
   * When a role is added, the tree is traversed, and for each 'parent'
   * the role has, any users with role equal to that parent role will 
   * get the new role in their subroles array.
   * 
   * @param {req}  The Express HTTP request with the role in the body
   * @param {res} The Express HTTP response object
   * @param {next} The Express HTTP next function
   *
   * @return {bool} whether or not the role was added
   */
  function updateRole(req, res, next) {

    var deferred = q.defer();

    var addedRole = new Roles();
    addedRole._id = req.body._id;
    addedRole.parent = req.body.parent || null;
    addedRole.parentForDescendants = req.body.parentForDescendants || [];

    if (addedRole._id === null || addedRole.parent === null) {
      deferred.reject({
        code: 500,
        error: "Role/parent cannot be null"
      });
    } else {
      Roles.findById(addedRole._id).then((role) => {

        var oldParent = role.parent;
        role.parent = addedRole.parent;
        role.save((err, data) => {
          if (err) {
            deferred.reject({
              code: 500,
              error: err
            });
          } else {
            Roles.find({}).then((allRoles) => {
              //need to update the parent of the direct descendants
              //if there were any

              _.forEach(allRoles, function(item) {

                if (item.parent === addedRole._id) {
                  item.parent = oldParent;
                  updateParentForRole(item._id, oldParent);
                }
              });

              var descendants = addedRole.parentForDescendants;

              if (descendants && descendants.length > 0) {
                //the role was a parent role, update the children's parent to the
                //role's parent
                _.forEach(descendants, function(child) {
                  var index = _.findIndex(allRoles, '_id', child);
                  allRoles[index].parent = addedRole._id;
                  updateParentForRole(child, addedRole._id);
                });
              }

              var oldparsub = getRolesByParent(oldParent, allRoles, []);
              userModule.flushSubroles(oldParent, oldparsub);

              //update the parent roles' subroles
              var parent = addedRole;
              logger.info("parent before loop: " + parent);

              while (parent !== null) {
                var subroles = getRolesByParent(parent._id, allRoles, []);
                logger.info("subroles: " + subroles);
                userModule.flushSubroles(parent._id, subroles);
                parent = _.find(allRoles, '_id', parent.parent);
                logger.info("parent in loop: " + parent);
              }
            });

            deferred.resolve({
              code: 201,
              error: "Saved Role\n"
            });

            logger.info("saved role: " + role._id);
          }
        });
      });
    }

    return deferred.promise
      .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });
  }

  /*
   * Removes a role from the database and updates any roles
   * that have this role as a parent to this role's parent
   *
   * @param {req}  The Express HTTP request with the role in the body
   * @param {res} The Express HTTP response object
   * @param {next} The Express HTTP next function
   *
   * @returns {void}
   */
  function removeRole(req, res, next) {

    var deferred = q.defer();

    if (req.params.id === null) {
      deferred.reject({
        code: 500,
        error: "Role cannot be null"
      });
    } else {
      Roles.findById(req.params.id).then((role) => {

        role.remove((err, data) => {
          if (err) {
            deferred.reject({
              code: 500,
              error: err
            });
          } else {
            deferred.resolve({
              code: 201,
              error: "Removed role\n"
            });
            logger.info("removed role: " + role._id);
          }
        });

        Roles.find({}).then((data) => {
          //need to update the parent of the direct descendants
          //if there were any
          var descendants = _.filter(data, 'parent', role._id);

          if (descendants && descendants.length > 0) {
            //the role was a parent role, update the children's parent to the
            //role's parent
            _.forEach(descendants, function(child) {
              child.parent = role.parent;
              updateParentForRole(child, role.parent);
            });
          }

          //update the parent roles' subroles
          var parent = _.find(data, '_id', role.parent);
          logger.info("parent before loop: " + parent);

          while (parent !== null) {
            var subroles = getRolesByParent(parent._id, data, []);
            logger.info("subroles: " + subroles);
            userModule.flushSubroles(parent._id, subroles);
            parent = _.find(data, '_id', parent.parent);
            logger.info("parent in loop: " + parent);
          }
        });
      });
    }

    return deferred.promise
      .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });
  }

  /*
   * Returns a tree object representing the role tree
   * begining at the target role or 'admin' role if no
   * target is specified
   */
  function getRoleTree(req, res, next) {
    rootRole = req.params.id? req.params.id : 'admin';
    getAllRoles()
      .then((data) => {
        var roleTree = buildTree(rootRole, data);
        res.status(200).send(roleTree);
      })
      .catch((error) => {
        res.status(500).send("Internal server error");
      })
  }
 



  // --------------------------- Private Function Definitions ----------------------------


  /*
  * Returns a formatted role tree object starting from the target
  */
  function buildTree(targetId, data) {
    var tree = {
      _id: targetId,
      children: getDirectDescendants(targetId, data)
    };
    for (var child in tree.children) {
      tree.children[child] = buildTree(tree.children[child]._id, data);
    }
    return tree;
  }


   /*
   *  Returns a promise to fetch all roles in the role collection
   */
  function getAllRoles() {
    return Roles.find({}).exec();
  }

  /*
   * This function returns a list of direct descendants for a given role
   */
  function getDirectDescendants(roleId, allRoles) {
    var results = _.filter(allRoles, function(val) {
      return val._doc.parent == roleId;
    });
    var formatted = results.map((x) => {
      var obj = {
        _id: x._id,
        children: []
      };
      return obj;
    });
    return formatted;
  }



  /*
   * Recursive function to get the subroles of a role
   * 
   * @param {parentRoleName}  The role name to find subroles for
   * @param {data} The list of roles currently in the database
   * @param {subroles} the list of subroles
   * @return [string] an unordered list of subroles
   */
  function getRolesByParent(parentRoleName, data, subroles) {
    var directDescendants = _.filter(data, 'parent', parentRoleName);
    if (directDescendants && directDescendants.length > 0) {
      _.forEach(directDescendants, function(descendant) {
        subroles.push(descendant._id);
        getRolesByParent(descendant._id, data, subroles);
      })
    }
    return subroles;
  }


  /*
   * Checks to see if a role exists
   * @param {roleName} the name of the role to check
   */
  function roleExists(roleName) {
    var deferred = q.defer();
    var roleCount = Roles.count({
      _id: roleName
    }, (err, count) => {

      logger.info(count);
      if (err) {
        return deferred.resolve(false);
      }
      return deferred.resolve(count > 0);
    });

    return deferred.promise;
  }

  /*
   * Updates a role's parent
   *
   * @param {rolelName} The name of the role to update
   * @param {roleParentName} The new parent name for the role
   */
  function updateParentForRole(roleName, roleParentName) {
    Roles.update({
        _id: roleName
      }, {
        $set: {
          parent: roleParentName,
          lastUpdated: new Date()
        }
      },
      (err, data) => {
        if (err) {
          logger.error("error updating parent for role", err.errmsg);
        }
      });
  }



  // --------------------------- Revealing Module Section ----------------------------

  return {
    create: addRole,
    update: updateRole,
    delete: removeRole,
    subroles: getSubroles,
    tree: getRoleTree
  }
}

module.exports = roleModule;
