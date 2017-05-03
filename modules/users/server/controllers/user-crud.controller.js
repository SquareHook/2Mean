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
   * @return {void}
   */
  function read(req, res, next) {
    var user = req.user;

    var id = req.params.userId || null; 

    if (!id) {
      return res.status(400).send('Malformed request');
    }

    if (isSelf(user, id) || isAuthorized(user, 'read')) {
      // Read from User database
      Users.findOne({_id: id})
        .then((user) => {
          res.status(201).send(user);
        }, (error) => {

          logger.error('User Module Error: Reading User from Database', error);
          res.status(500).send('Error retrieving user information');
        });
    } else {
      return res.status(401).send('Unauthorized');
    }
  }

  /**
  * Returns a list of users from the database sorted by
  * username. Page should be supplied as a url parameter
  *
  * @param {Request} req   The Express request object.
  * @param {Response} res  The Express response object.
  * @param {Next} next     The Express next (middleware) function.
  *
  * @return {void}
  */
  function list(req, res)
  {
    let page = req.query.page || 1;
    let search = req.query.search || "";
    let skip = (page - 1) * pageLimit;
    let queryObj;
    if (search === "") {
      queryObj = {};
    }
    else {
      queryObj = {
        'username': new RegExp('[a-z]*'+search +'+?', 'i')
      };
    }

    var deferred = q.defer();
 
    Users.find(queryObj, (err, users) => {
      if (err) {
        logger.error(err);
        deferred.reject({
          code: 500,
          error: 'Internal Server Error'
        });
      }
      else {
        let sanitized = [];
        for(let i in users)
        {
          sanitized.push(sanitizeUser(users[i]));
        }
        deferred.resolve({
          code: 200,
          data: sanitized
        })
      }
    })
      .sort('username')
      .skip(skip)
      .limit(pageLimit);


    return deferred.promise
      .then((data) => {
        
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });
  }

  /**
   * Main function to handle create for the users collection.
   *
   * @param {Request} req   The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next} next     The Express next (middleware) function.
   *
   * @return {void}
   */
  function create(req, res, next) {
    var user = req.user;

    var body = req.body;

    var deferred = q.defer();

    if (isAuthorized(user, 'create')) {
      let newUser = mapUser(body);
      newUser.profileImageURL = generateProfileImageURL(newUser.email);

      newUser.save((err, data) => {
        if (err) {
          // TODO: Need to get more granular with errors, some reflect duplicate emails, etc.
          logger.error('Creating User Error', err);
          deferred.reject({
            code: 500,
            error: 'Internal Server Error'
          });
        } else {
          logger.info('User created: ' + newUser.username);
          deferred.resolve({
            code: 201,
            data: data
          });
        }

      });
    } else {
      deferred.reject({
        code: 401,
        error: 'Unauthorized'
      });
    }

    return deferred.promise
      .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });
  }

  /**
   * Main function to handle update for the users collection.
   *
   * @param {Request}  req  The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next}     next The Express next (middleware) function.
   *
   * @return {void}
   */
  function update(req, res, next) {
    var user = req.user;

    var existingUser = mapUser(req.body);

    var deferred = q.defer();

    // validate the body.
    if (!existingUser.email) {
      deferred.reject({
        code: 400,
        error: 'Malformed request.  Email needed.'
      });
    } else {
      Users.findById(existingUser._id)
        .then((modifiedUser) => {
          // findOne will resolve to null (no error) if no document found
          if (modifiedUser) {
            var keys = Object.keys(Users.schema.obj);

            for (var i in keys) {
              if (existingUser[keys[i]]) {
                // save to existing user's id
                if (keys[i] !== '_id') {
                  modifiedUser[keys[i]] = existingUser[keys[i]];
                }
              }
            }
            modifiedUser.updated = new Date();

            modifiedUser.save((err, data) => {
              if (err) {
                logger.error('Error updating user', err);

                deferred.reject({
                  code: 500,
                  error: 'Internal Server Error'
                });
              } else {
                deferred.resolve({
                  code: 200,
                  data: sanitizeUser(data)
                });
              }
            });
          } else {
            logger.error('Error updating user, user does not exist');
            // trying to change a non existent user
            deferred.reject({
              code: 500,
              error: { message: 'Internal Server Error' }
            });
          }
        }, (err) => {
          logger.error('Error looking up user in User collection: ', err);

          deferred.reject({
            code: 500,
            error: 'Internal Server Error'
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

    getListOfUsers(userList)
      .then((data) => {
        res.status(200).send(data);
      },
      (error) => {
        res.status(500).send('Internal Server Error');
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
    if (isAuthorized(req.user, 'delete')) {
      Users.findOne({_id: userId}).remove((err, data) => {
        if (err) {
          logger.error('Error removing user', err);
          res.status(500).send({success: false, message: "Internal Server Error"});
        } else {
          if(data.result.ok && data.result.n > 0)
          {
            res.status(200).send({success: true, message: "Deleted user with id: " + userId});
          }
          else
          {
            res.status(200).send({success: false, messsage: "Unable to delete user with id: " + userId});
          }
        }
      });
    }
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
   function updateUserRoles(userId, targetRole, subroles)
   {
     let query = {_id: userId};
     let update = {$set: {role: targetRole, subroles: subroles}};
     return Users.update(query, update);
     
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
    return new Promise((resolve, reject) => {
      Users.find({ '_id': { '$in': userIdList } })
        .select(this.SANITIZED_SELECTION)
        .then((data) => {
          resolve(data);
        },
        (error) => {
          reject(error);
        });
    });
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
    sanitized.verification.token = undefined;
    // remove password rest token
    sanitized.resetPassword.token = undefined;

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
    list                  : list
  };
}

module.exports = userCrudController;
