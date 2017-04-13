/**
 * Database handle.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/**
 * User model.
 */
var Users = mongoose.model('User');

/**
 * Key model.
 */
var Keys = mongoose.model('Keys');

/**
 * Q promise library.
 */
var q = require('q');

/*
 * Underscore/Lodash functionality.
 */
var _ = require('lodash');

/*
 * path for resolving files
 */
var path = require('path');

/*
 * fs for unlinking files
 */
var fs = require('fs');

/*
 * application config
 */
var config = require(path.resolve('config/config'));

var md5 = require('md5');

/**
 * Main business logic for handling requests.
 */
function userAuthController(logger, shared) {
  // --------------------------- Public Function Definitions ----------------------------
  const pageLimit = 25;

  var authHelpers = shared.authHelpers;

  /**
   * Registers a new user with bare minimum roles.
   *
   * @param {Request} req   The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next} next     The Express next (middleware) function.
   *
   * @return {void}
   */
  function register(req, res, next) {
    var user = req.user;

    var body = req.body;

    var deferred = q.defer();

    var SANITIZED_SELECTION = 'created displayName email firstName lastName profileImageURL role subroles username';

    let newUser = mapUser(body);
    newUser.profileImageURL = generateProfileImageURL(newUser.email);

    // Overwrite any roles set or make sure they get set appropriately.
    newUser.role = 'user';
    
    if (!isStrongPassword(newUser.password)) {
      deferred.reject({
        code: 400,
        error: 'Invalid password: ' + config.auth.invalidPasswordMessage
      });
    } else {
      authHelpers.hashPassword(newUser.password).then((hash) => {
        newUser.password = hash;
      
        // save the user
        newUser.save((err, data) => {
          if (err) {
            let errors = extractMongooseErrors(err.errors);
            let validation = _.find(errors, (o) => {
              return (o.name === 'ValidatorError'); 
            });

            if (validation) {
              logger.error('Validation error on registering a new user', validation);
              deferred.reject({
                code: 400,
                error: validation.message
              });
            } else {
              // check for specific codes to provide feedback to ui
              let errObj = err.toJSON();
              let code = errObj.code;
              let errmsg = errObj.errmsg;

              // user already exists
              // 11000 code is from mongoose
              if (code === 11000) {
                let errmsgList = errmsg.split(' ');
                // index is the duplicate key
                let index = errmsgList[errmsgList.indexOf('index:')+1];

                // TODO implement email-password login and registration
                // confirmation emails. Otherwise usernames could be enumerated
                // with this endpoint. Until then send back generic error
                // message

                if (index === 'username_1') {
                  deferred.reject({
                    code: 500, 
                    error: 'Username is taken'
                  });
                } else {
                  deferred.reject({
                    code: 500,
                    error: 'Internal Server Error'
                  });
                }
              } else {
                logger.error('Creating User Error', err.errmsg);
                deferred.reject({
                  code: 500,
                  error: 'Internal Server Error'
                });
              }

            }
          } else {
            logger.info('User created: ' + newUser.username);
            deferred.resolve({
              code: 201,
              data: data
            });
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

  /**
   * changes a user's password if the password sent is verified with their old
   * hash
   *
   * @param {Request}   req   The Express request object
   *                    req.body.newPassword
   * @param {Response}  res   The Express response object
   * @param {Next}      next  The Express next (middleware) function
   *
   * @returns {void}
   */
  function changePassword(req, res, next) {
    // this is the user injected by the auth middleware
    var user = req.user;
    
    // this is the old password the user has entered
    let oldPassword = req.body.oldPassword;

    // this is the password the user wants to change to
    let newPassword = req.body.newPassword;

    return authHelpers.verifyPassword(user.password, oldPassword).then((match) => {
      if (match) {
        // check password strength
        if (!isStrongPassword(newPassword)) {
          throw new Error('Invalid password');
        } else {
          return authHelpers.hashPassword(newPassword);
        }
      } else {
        throw new Error('Incorrect password');
      }
    }).then((hash) => {
      // password has been hashed save it to the user
      user.password = hash;

      return user.save();
    }).then((savedUser) => {
      // user has been saved
      res.status(200).send(savedUser);
    }).catch((error) => {
      // something rejected or threw up
      // extract any mongoose errors
      let errors = extractMongooseErrors(error.errors);
      let validation = _.filter(errors, (o) => {
        return o.name === 'ValidatorError';
      });

      if (validation.length) {
        // error is from mong
        res.status(400).send({
          message: error.message
        });
      } else if (error.message === 'Invalid password') {
        // user sent an invalid new password
        res.status(400).send({
          message: 'Invalid password: ' + config.auth.invalidPasswordMessage
        });
      } else if (error.message === 'Incorrect password') {
        // user sent wrong old password
        logger.info('Incorrect password', { username: user.username });
        res.status(400).send({ message: 'Incorrect Username/Password' });
      } else {
        // not sure what went wrong
        logger.error('Error changing password', error);
        res.status(500).send();
      }
    });
  }

  // --------------------------- Private Function Definitions ----------------------------

  function extractMongooseErrors(error) {
    var errors = [];

    for (var field in error) {
      errors.push(error[field]);
    }

    return errors;
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

  /*
   * checks the password is valid
   * by default:
   *  the password contain UPPER, lower, digit, and 5ymb0l
   *  the password must be at least 8 characters long
   * theses validation settings can be changed in the configuration
   */
  function isStrongPassword(password) {
    // get config (/config/config.js)
    var strengthRe = config.auth.passwordStrengthRe;

    // apply the re
    return strengthRe.test(password);
  }

  function generateProfileImageURL(email) {
    let hash = md5(email.toLowerCase());
    return 'https://gravatar.com/avatar/' + hash + '?d=identicon';
  }

  // --------------------------- Revealing Module Section ----------------------------

  return {
    register              : register,
    changePassword        : changePassword
  };
}

module.exports = userAuthController;
