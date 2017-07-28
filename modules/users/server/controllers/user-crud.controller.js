/**
 * Database handle.
 */
var mongoose = require('mongoose');
//tell mongoose to use q promise library promises
mongoose.Promise = require('q').Promise;

/**
 * User model.
 */
var Users = mongoose.model('User');

/**
 * Q promise library.
 */
var q = require('q');

/*
 * Underscore/Lodash functionality.
 */
var _ = require('lodash');
var md5 = require('md5');

/**
 * Main business logic for handling requests.
 */
function userCrudController(logger, shared) {
  // --------------------------- Public Function Definitions ----------------------------
  const pageLimit = 25;
  const ADMIN_ROLE_NAME = 'admin';
  const DEFAULT_ROLE_NAME = 'user';

  let authHelpers = shared.authHelpers;

  /**
   * Reads a user from the database if the permissions are adequate.
   *
   * @param {Request} req   The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next} next     The Express next (middleware) function.
   *
   * @return {Promise}
   */
  function read(req, res, next) {
    var user = req.user;

    var id = req.params.userId || null; 

    return new Promise((resolve, reject) => {
      if (!id) {
        // missing id
        reject(new Error('Malformed request'));
      } else if (isSelf(user, id) || isAuthorized(user, 'read')) {
        // check if allowed
        resolve(Users.findOne({ _id: id }).exec());
      } else {
        // not allowed
        reject(new Error('Forbidden'));
      }
    }).then((foundUser) => {
      if (foundUser) {
        res.status(200).send(sanitizeUser(user));
      } else {
        throw new Error('Not found');
      }
    }).catch((error) => {
      // handle errors. message sent depends on error message
      if (error.message === 'Malformed request') {
        res.status(400).send({ error: error.message });
      } else if(error.message === 'Forbidden') {
        res.status(403).send();
      } else if (error.message === 'Not found') {
        res.status(404).send();
      } else {
        logger.error('Error user.crud#read', error);
        res.status(500).send();
      }
    });
  }

  /**
  * Returns a list of users from the database sorted by
  * username. Page should be supplied as a url parameter
  *
  * @param {Request} req   The Express request object.
  * @param {Response} res  The Express response object.
  * @param {Function} next     The Express next (middleware) function.
  *
  * @return {Promise}
  */
  function list(req, res, next) {
    let page = req.query.page || 1;
    let search = req.query.search || "";
    let skip = (page - 1) * pageLimit;
    let queryObj;

    if (search === "") {
      queryObj = {};
    } else {
      queryObj = {
        'username': new RegExp('[a-z]*'+search +'+?', 'i')
      };
    }

    return Users.find(queryObj)
      .sort('username')
      .skip(skip)
      .limit(pageLimit)
      .exec()
      .then((foundUsers) => {
        let sanitized = [];

        for (let i in foundUsers) {
          sanitized.push(sanitizeUser(foundUsers[i]));
        }

        res.status(200).send(sanitized);
      }).catch((error) => {
        logger.error('Error user.crud#list', error);
        res.status(500).send();
      });
  }

  /**
   * Main function to handle create for the users collection.
   *
   * @param {Request} req   The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next} next     The Express next (middleware) function.
   *
   * @return {Promise}
   */
  function create(req, res, next) {
    var user = req.user;

    var body = req.body;

    return new Promise((resolve, reject) => {
      if (isAuthorized(user, 'create')) {
        let newUser = mapUser(body);
        newUser.profileImageURL = generateProfileImageURL(newUser.email);

        resolve(newUser.save());
      } else {
        reject(new Error('Forbidden'));
      }
    }).then((savedUser) => {
      logger.info('User created', { username: savedUser.username });
      res.status(201).send(sanitizeUser(savedUser));
    }).catch((error) => {
      if (error.errors) {
        res.status(400).send({ error: error.errors });
      } else if (error.message === 'Forbidden') {
        res.status(403).send();
      } else {
        logger.error('Error user.crud#create', error);
        res.status(500).send();
      }
    });
  }

  /**
   * Main function to handle update for the users collection.
   *
   * @param {Request}  req  The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next}     next The Express next (middleware) function.
   *
   * @return {Promise}
   */
  function update(req, res, next) {
    var user = req.user;

    var updates = req.body;

    var deferred = q.defer();

    return new Promise((resolve, reject) => {
      if (updates._id) {
        resolve(Users.findOne({ _id: updates._id }).exec())
      } else {
        reject(new Error('Missing user._id'));
      }
    }).then((foundUser) => {
      if (foundUser) {
        // update the found user
        mapOverUser(updates, foundUser);
        
        foundUser.updated = new Date();
      
        return foundUser.save();
      } else {
        throw new Error('Not found');
      }
    }).then((savedUser) => {
      res.status(200).send(sanitizeUser(savedUser));
    }).catch((error) => {
      if (error.message === 'Missing user._id') {
        res.status(400).send({ error: error.message });
      } else if (error.errors) {
        res.status(400).send({ error: error.errors });
      } else if (error.message === 'Not found') {
        res.status(404).send();
      } else {
        logger.error('Error user.crud#update', error);
        res.status(500).send();
      }
    });
  }

  /**
   * Main function to handle delete for the users collection.
   *
   * The request should be a comma separated list of id's in a GET request (per the routes config).
   *
   * @param {Request}  req  The Express request object.
   * @param {Response} res  The Express response object.
   *
   * @return {void}
   */
  function readList(req, res) {
    var userList = req.params.userList.split(',');

    return Users.find({ _id: { $in: userList } })
      .select(this.SANITIZED_SELECTION)
      .exec()
      .then((foundUsers) => {
        res.status(200).send(foundUsers);
      }).catch((error) => {
        logger.error('Error user.crud#readList', error);
        res.status(500).send();
      });
  }

  /**
   * Main function to handle delete for the users collection.
   *
   * @param {Request} req   The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next} next     The Express next (middleware) function.
   *
   * @return {void}
   */
  function deleteUser(req, res, next) {
    var userId = req.params.userId;
    
    return new Promise((resolve, reject) => {
      if (isAuthorized(req.user, 'delete')) {
        resolve(Users.findOne({ _id: userId }).remove());
      } else {
        reject(new Error('Forbidden'));
      }
    }).then((result) => {
      res.status(204).send();
    }).catch((error) => {
      if (error.message === 'Forbidden') {
        res.status(403).send();
      } else {
        logger.error('Error user.crud#deleteUser', error);
        res.status(500).send();
      }
    });
  }


  /**
   * Handles user updates sent by an admin user
   * @param {Request} req   The Express request object
   * @param {Response} res  The Express response object
   */
  function adminUpdate(req, res) {
    if (!isAuthorized(req.user)) {
      res.status(403).send({ success: false, message: "Forbidden" });
      return;
    }

    let deferred = q.defer();
    let user = req.body;

    return new Promise((resolve, reject) => {
      //note that this doesn't affect user roles
      let updateDef = {
        $set: {
          firstName: user.firstName,
          lastName: user.lastName,
          updated: new Date()
        }
      };

      // should only send a password if it is to be updated
      if (user.password) {
        authHelpers.hashPassword(user.password).then((hash) => {
          updateDef.$set.password = hash;
          resolve(updateDef);
        }).catch((error) => { reject(error); });
      } else {
        resolve(updateDef);
      }
    }).then((updateDef) => {
      //send update to mongo
      return Users.update({ _id: req.body._id }, updateDef).exec();
    }).then((updatedUsers) => {
      res.status(200).send(updatedUsers);
    }).catch((error) => {
      console.log(error);
      logger.error('Error updating user', error);
      res.status(500).send();
    });
   }

  /*
   * Updates all subroles for a given role 
   */
   function flushSubroles(parentRole, subroles)
   {
      logger.info("Updating user subroles");
      Users.update({role: parentRole}, {$set: {subroles: subroles}},{multi: true}, (err, data) =>
      {
        if(err)
        {
          logger.error("error updating subroles for affected users", err.errmsg)
        }
      });
   }

   function removeSubroles(subroles)
   {
      logger.info("removing subroles " + subroles);
      logger.info(subroles);
      for(let i = 0; i < subroles.length; i++)
      {
        Users.update({subroles: subroles[i]}, {$pull: {subroles: subroles[i]}}, {multi: true}, function(err, data)
        {
          if(err)
          {
            logger.error(err);
          }
        });
      }
     
   }

   /**
    * Updates a users roles
    * @param {userId} the id of the user to update
    * @param {targetRole} the role to place the user in
    * @param {subroles} a list of corres
    * @returns {Promise} an update promise
    */
   function updateUserRoles(userId, targetRole, subroles) {
     let query = {_id: userId};
     let update = {$set: {role: targetRole, subroles: subroles}};
     return Users.update(query, update);
     
   }
   
  /**
   * method for getting own user (provided by req.user)
   */
  function readSelf(req, res, next) {
    let user = req.user;

    res.status(200).send(sanitizeUser(user));
  }


  // --------------------------- Private Function Definitions ----------------------------

  /**
   * Given an array of ids, this function will retrieve the user objects.
   *
   * @param {Array<String>} userIdList The array of ids to lookup.
   *
   * @return {Array<Users>}
   */
  function getListOfUsers(userIdList) {
  }
  
  /*
   * Checks if the request is to the requestors data.
   */
  function isSelf(user, id) {
    if (user._id === id) {
      return true;
    }
    return false;
  }

  /*
   * Verfies the user is authorized to make changes.
   *
   * TODO: This could probably be more robust.
   */
  function isAuthorized(user, action) {
    if (_.indexOf(user.role, ADMIN_ROLE_NAME)) {
      return true;
    }

    return false;
  }

  function sanitizeUser(user) {
    // cheat a deep copy with JSON
    let sanitized = JSON.parse(JSON.stringify(user));
    sanitized.password = undefined;
    // remove the token. The user has to look at their email. no cheating
    if (sanitized.verification) {
      sanitized.verification.token = undefined;
    }
    // remove password rest token
    if (sanitized.resetPassword) {
      sanitized.resetPassword.token = undefined;
    }

    return sanitized;
  }
  /*
   * Maps the post request representation of a user to a mongoose User model.
   *
   * @param {Object} body The body of the request.
   *
   * @return {User}
   */
  function mapUser(body) {
    var user = new Users();
    var schemaFields = Users.schema.obj;
    var index;

    for(index in Object.keys(schemaFields)) {
      let realIndex = Object.keys(schemaFields)[index];
      if (body[realIndex]) {
        user[realIndex] = body[realIndex];
      }
    }

    if (body._id) {
      user._id = body._id;
    }

    user.updated = new Date();
    user.created = new Date();

    return user;
  }
  
  function generateProfileImageURL(email) {
    let hash = md5(email.toLowerCase());
    return 'https://gravatar.com/avatar/' + hash + '?d=identicon';
  }
    
  /**
   * @param {Object} updates 
   * @param {Object} user
   */
  function mapOverUser(updates, user) {
    let schemaFields = Users.schema.obj;

    for (let index in Object.keys(schemaFields)) {
      let realIndex = Object.keys(schemaFields)[index];
      if (updates[realIndex]) {
        user[realIndex] = updates[realIndex];
      }
    }
  }

  // --------------------------- Revealing Module Section ----------------------------

  return {
    read                  : read,
    create                : create,
    update                : update,
    deleteUser            : deleteUser,
    adminUpdate           : adminUpdate,
    updateUserRoles       : updateUserRoles,
    flushSubroles         : flushSubroles,
    removeSubroles        : removeSubroles,
    readList              : readList,
    list                  : list,
    readSelf              : readSelf
  };
}

module.exports = userCrudController;
