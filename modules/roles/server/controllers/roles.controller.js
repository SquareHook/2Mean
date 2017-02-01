
/* promise.done(onSuccess, onError)
 simply allows you to process resolved value. An additional benefit is that does not imply any error swallowing (as it is the case with promise.then()), it guarantees that any involved exception would be exposed. It also effectively ends the chain and does not return any further promise.


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
var Promise = q.promise;


// ---------------------------- Module Definition ----------------------------
function roleModule(logger, userModule)
{

  // check to make sure there exists an admin role with parent set to null
  //if one doesn't exist, create it.
  var adminCount = Roles.count(
  {
    _id: 'admin',
    parent: null
  }, (err, count) =>
  {
    if (count < 1)
    {
      var role = new Roles();
      role._id = 'admin';
      role.parent = null;
      role.save((err, data) =>
      {
        if (err)
        {
          logger.log('crit',"Failed to create default admin role");
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
  function addRole(req, res, next)
  {
    //validation check
    if (!req.body._id || !req.body.parent)
    {
      return sendServerError(res, "required role fields not set", 400);
    }
    //map request body params to a role
    var role = new Roles();
    role._id = req.body._id;
    role.parent = req.body.parent;
    role.canModify = req.body.canModify || false;
    role.parentForDescendants = req.body.parentForDescendants || [];

  
    Roles.count({_id: req.body.parent}).exec()
    .then( count =>
    {
        if(count < 1)
        {
          return new Promise((resolve, reject) =>
          {
            reject("parent not found");
          });
        }
        else
        {
          return new Promise((resolve, reject) => {
            resolve("ok");
          });
        }
    })
    .then(ok => {
      return role.save();
    })
    .then(data =>
    {
      return updateDirectDescendants(role);
    })
    .then(ok =>
    {
      return getAllRoles();
    })
    .then(data =>
    {
      return updateSubroles(data, role)
    })
    .then(data =>
    {
      res.status(201).send(
      {
        success: true,
        data: data
      });
    })
    .catch(error =>
    {
      if(error.code && error.code === 11000)
      {
        sendServerError(res, error, 400);
      } 
      sendServerError(res, error);
    })
  }

  function updateDirectDescendants(role)
  {
    //in this case we are inserting a role above one or more existing roles
    //update the parent of any direct descendants
    return new Promise((resolve, reject) =>
    {
      _.forEach(role.parentForDescendants, (child) =>
      {
        updateParentForRole(node, role._id)
      });
      resolve(true);
    });
  }


  /*
   * Updates a role's parent
   */
  function updateParentForRole(roleName, roleParentName)
  {

    return Roles.update(
    {
      _id: roleName
    },
    {
      $set:
      {
        parent: roleParentName,
        lastUpdated: new Date()
      }
    });
  }

  function updateSubroles(data, role)
  {
    return new Promise((resolve, reject) =>
    {
      //update the parent roles' subroles
      let parent = _.find(data, '_id', role.parent);
      while (parent)
      {
        var subroles = getRolesByParent(parent._id, data, []);
        userModule.flushSubroles(parent._id, subroles);
        parent = _.find(data, '_id', parent.parent);
      }
      resolve("roles updated");
    });
  }

  /*
   * Recursive function to get the subroles of a role
   */
  function getRolesByParent(parentRoleName, data, subroles)
  {
    var directDescendants = _.filter(data, 'parent', parentRoleName);
    if (directDescendants && directDescendants.length > 0)
    {
      _.forEach(directDescendants, function(descendant)
      {
        subroles.push(descendant._id);
        getRolesByParent(descendant._id, data, subroles);
      })
    }
    return subroles;
  }


  /*
   * Returns an unordered list of subroles for a given role
   * 
   * @param {targetRole} the role to get subroles for
   * @return [Role] a list of subroles (if any)
   */
  function getSubroles(req, res, next)
  {
    if (!req.params.id)
    {
      sendServerError(res, "no role id provided", 400);
    }
    getAllRoles()
      .then((data) =>
      {
        var list = getRolesByParent(req.params.id, data, []);
        res.status(200).send(list);
      })
      .catch((err) =>
      {
        sendServerError(res, "error getting subroles");
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
  function updateRole(req, res, next)
  {
    var addedRole = new Roles();
    addedRole._id = req.body._id;
    addedRole.parent = req.body.parent || null;
    addedRole.parentForDescendants = req.body.parentForDescendants || [];

    if (addedRole._id === null || addedRole.parent === null)
    {
      return sendServerError(res,'missing required prameters, must supply role id and parent id', 400);
    }
    Roles.findById(addedRole._id)
    .then(role =>
    {
      return new Promise((resolve, reject) =>
      {
          var oldParent = role.parent;
          role.parent = addedRole.parent;
          resolve(true)
      });
     })
     .then(ok =>
     {
       return getAllRoles();
     })
     .then(allRoles =>
     {
       return new Promise((resolve, reject) =>
       {
        _.forEach(allRoles, function(item)
        {
         if (item.parent === addedRole._id)
         {
            item.parent = oldParent;
            updateParentForRole(item._id, oldParent);
          }
         });
         var descendants = addedRole.parentForDescendants;
         if (descendants && descendants.length > 0)
         {
           //the role was a parent role, update the children's parent to the
           //role's parent
           _.forEach(descendants, function(child)
           {
              var index = _.findIndex(allRoles, '_id', child);
              allRoles[index].parent = addedRole._id;
              updateParentForRole(child, addedRole._id);
            });
          }
          var oldparsub = getRolesByParent(oldParent, allRoles, []);
          userModule.flushSubroles(oldParent, oldparsub);

          //update the parent roles' subroles
          var parent = addedRole;
          while (parent !== null)
          {
            var subroles = getRolesByParent(parent._id, allRoles, []);
            userModule.flushSubroles(parent._id, subroles);
            parent = _.find(allRoles, '_id', parent.parent);
          }

        return res.status(200).send(
         {
            success: true,
            message: "updated parent roles and children"
         });

        }); //end promise
      })
      .catch(error)
      {
        return sendServerError(res,error);
      }
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
  function removeRole(req, res, next)
  {
    if (!req.params.id)
    {
      return sendServerError(res, "missing role id param", 400);
    }

    Roles.findOneAndRemove({_id: req.params.id}).exec()
    .then(data =>
    {
      return new Promise(resolve, reject)
      {
        if (data)
        {
          resolve(true);
        }
        else
        {
          reject("failed to remove role");
        }
      }
    })
    .then(ok =>
    {
      return getAllRoles();
    })
    .then(data =>
    {
      return new Promise(resolve, reject)
      {
        //need to update the parent of the direct descendants
        //if there were any
        var descendants = _.filter(data, 'parent', role._id);

        if (descendants && descendants.length > 0)
        {
          //the role was a parent role, update the children's parent to the
          //role's parent
          _.forEach(descendants, function(child)
          {
            child.parent = role.parent;
            updateParentForRole(child, role.parent);
          });
        }

        //update the parent roles' subroles
        var parent = _.find(data, '_id', role.parent);

        while (parent !== null)
        {
          var subroles = getRolesByParent(parent._id, data, []);
          userModule.flushSubroles(parent._id, subroles);
          parent = _.find(data, '_id', parent.parent);
        }
        resolve(true);
      }
    })
    .then(ok =>
    {
      res.status(200).send({success: true, message: "deleted role"});
    })
    .catch(error =>
    {
      return sendServerError(res, error);
    });

  }

  /*
   * Returns a tree object representing the role tree
   * begining at the target role or 'admin' role if no
   * target is specified
   */
  function getRoleTree(req, res, next)
  {
    rootRole = req.params.id ? req.params.id : 'admin';
    getAllRoles()
    .then((data) =>
    {
      var roleTree = buildTree(rootRole, data);
      return res.status(200).send(roleTree);
    })
    .catch((error) =>
    {
      return sendServerError(res,"could not get role tree");
    });
  }


  /*
   * Returns a formatted role tree object starting from the target
   */
  function buildTree(targetId, data)
  {
    var tree = {
      _id: targetId,
      children: getDirectDescendants(targetId, data)
    };
    for (var child in tree.children)
    {
      tree.children[child] = buildTree(tree.children[child]._id, data);
    }
    return tree;
  }


  /*
   *  Returns a promise to fetch all roles in the role collection
   */
  function getAllRoles()
  {
    return Roles.find({}).exec();
  }

  /*
   * This function returns a list of direct descendants for a given role
   */
  function getDirectDescendants(roleId, allRoles)
  {
    var results = _.filter(allRoles, function(val)
    {
      return val._doc.parent == roleId;
    });
    var formatted = results.map((x) =>
    {
      var obj = {
        _id: x._id,
        children: []
      };
      return obj;
    });
    return formatted;
  }

  function sendServerError(res, error, code)
  {
    code = code || 500;
    logger.error(error);
    res.status(code).send(
    {
      success: false,
      error: error
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
