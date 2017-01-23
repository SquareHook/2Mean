var mongoose = require('mongoose');

var Roles = mongoose.model('Roles');
var q = require('q');
var path = require('path');
var config = require(path.resolve('config/config'));

// ---------------------------- Module Definition ----------------------------
function roleModule(logger) {

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
 		 //make sure the role is valid
 		 if(role._id != null)
 		 {
 		 		var addedRole = new Roles();
 		 		addedRole._id = role._id;
 		 		addedRole.parent = role.parent || null;
 		 		role.canModify = role.canModify || false;

 		 		//save will fail if _id isn't unique
 		 		addedRole.save((err, data) => {
 		 		  
          if(err)
          {
            res.status(500).send("Internal server error");
          }
          else
          {
            res.status(201).send("Inserted role");
          }
 		 		});

 		 }
 	}  




}






  // --------------------------- Revealing Module Section ----------------------------

  return {
    create: addRole
  }
};

module.exports = roleModule;
