var mongoose = require('mongoose');

var Roles = mongoose.model('Roles');


var q = require('q');
var path = require('path');
var config = require(path.resolve('config/config'));
var _ = require('lodash');

var Users = mongoose.model('User');

// ---------------------------- Module Definition ----------------------------
function roleModule(logger, userModule) {

  /*
  * check to make sure there exists an admin role with parent set to null
  * if one doesn't exist, create it.
  */
  var adminCount = Roles.count({_id: 'admin', parent: null}, (err, count) =>{
    if(count < 1)
    {
      var role = new Roles();
      role._id = 'admin';
      role.parent = null;
      role.save((err, data) => {
        if(err)
        {
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
  function addRole(req, res, next) 
  {
      var role = req.body;
     //make sure the role is valid
     if(role._id != null)
     {
        var addedRole = new Roles();
        addedRole._id = role._id;
        addedRole.parent = role.parent || null;
        role.canModify = role.canModify || false;
        role.parentForDescendants = role.parentForDescendants || [];

        console.log(roleExists(addedRole.parent));
        //check to make sure the parent exists
        if(addedRole.parent === null || !roleExists(addedRole.parent))
        {
          res.status(500).send("Parent must be a valid role");
          return;
        }


        //save will fail if _id isn't unique
        addedRole.save((err, data) => {
          if(err)
          {
            res.status(500).send("There is already a role with that name");
            return;
          }
          else
          {
            //the role was inserted into the roles collection
            //now we need to update the parent of the direct descendants
            //if there are any
            logger.info("80");
            if(role.parentForDescendants && role.parentForDescendants.length > 0)
            {
              //in this case we are inserting a role above one or more existing roles
              _.forEach(role.parentForDescendants, function(node)
              {
                  //we set that descendant's parent to this role._id
                  updateParentForRole(node, role._id);
              });
            }

            var subroles = getSubroles(role.parent);
            flushSubroles(role._id, subroles );
            res.status(201).send("Inserted role\n");
          }
        });
     }
     else
     {
      res.status(500).send("Validtion does not pass");
      return;
     }
   }

  /*
  * This function will get the subroles of a given role
  * 
  * @param {roleName}  The name of the role
  *
  * @return [string] a list of subroles
  */
   function getSubroles(roleName)
   {
    var allRoles = getAllRoles();

    //data contains a list of role objects
    return getRolesByParent(roleName, allRoles, [])
   
   }

   /*
   * Returns an undordered list of all the role objects
   * in the role collection 
   */
   function getAllRoles()
   {
      var deferred = q.defer();
      Roles.find({}, (err, data) => {
        if(err)
        {
          return deferred.resolve(false);
        }
        return deferred.resolve(count > 0);
    });

    return deferred.promise;
    }

   /*
   * Recursive function to get the subroles of a role
   * 
   * @param {parentRoleName}  The role name to find subroles for
   * @param {data} The list of roles currently in the database
   * @param {subroles} the list of subroles
   * @return [string] an unordered list of subroles
   */
   function getRolesByParent(parentRoleName, data, subroles)
   {
      var directDescendants = [];

      if(data && data.length > 0)
      {
        _.forEach(data, function(role){
          if(role.parent == parentRoleName)
          {
            directDescendants.push(role);
          }
        });
      }

      if(directDescendants && directDescendants.length > 0)
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
   * Checks to see if a role exists
   * @param {roleName} the name of the role to check
   */
   function roleExists(roleName)
   {
    var deferred = q.defer();
    var roleCount = Roles.count({_id: roleName}, (err, count) =>{

      if(err)
      {
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
   function updateParentForRole(roleName, roleParentName)
   {  
      Roles.update({_id: roleName}, { $set: {parent: roleParentName}}, 
      (err, data) =>
        {
          if(err)
         {
           logger.error("error updating parent for role", err.errmsg);
         }  
      });
   }


   /*
   * updates any users with parentRole as their role
   * to put subroles as their subroles
   */
   function flushSubroles(parentRole, subroles)
   {
      Users.update({role: parentRole}, {$set: {subroles: subroles}}, (err, data) =>
      {
        if(err)
        {
          logger.error("error updating subroles for affected users", err.errmsg)
        }
      });

   }

   /*
   * Returns an object representing the role tree beginning with the startingRole
   */
   function getRoleTree(startingRole)
   {
     var rootId = startingRole || 'admin';
     var roleTree = {
       _id: rootId,
       children: [

       ]
     };
   }

   function getDirectDescendants(roleId, allRoles)
   {
     return _.filter(allRoles, function(value)
     {
        return value._id === roleId;
     })
   }


  // --------------------------- Revealing Module Section ----------------------------

  return {
    create: addRole,
    getRoleTree: getRoleTree
  }
}

module.exports = roleModule;
