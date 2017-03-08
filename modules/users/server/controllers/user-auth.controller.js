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
 * argon2 password hashing algorithm
 */
var argon2 = require('argon2');

/*
 * application config
 */
var config = require(path.resolve('config/config'));

var md5 = require('md5');

/**
 * Main business logic for handling requests.
 */
function userAuthController(logger) {
  // --------------------------- Public Function Definitions ----------------------------
  const pageLimit = 25;
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
      // get password and salt
      argon2.generateSalt().then(salt => {
        argon2.hash(newUser.password, salt).then(hash => {
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
    // set up deferred promise
    var deferred = q.defer();

    // this is the user injected by the auth middleware
    var user = req.user;
    
    // this is the old password the user has entered
    let oldPassword = req.body.oldPassword;

    // this is the password the user wants to change to
    let newPassword = req.body.newPassword;

    // check user's password is correct
    argon2.verify(user.password, oldPassword).then(match => {
      if (match) {
        // check password strength
        if (!isStrongPassword(newPassword)) {
          deferred.reject({
            code: 400,
            error: { message: 'Invalid password: ' + 
                     config.auth.invalidPasswordMessage }
          });
        } else {
          // generate new hash
          argon2.generateSalt().then(salt => {
            argon2.hash(newPassword, salt).then(hash => {
              user.password = hash;

              user.save((err, data) => {
                if (err) {
                  let errors = extractMongooseErrors(err.errors);
                  let validation = _.fild(errors, (o) => {
                    return (o.name === 'ValidatorError');
                  });

                  if (validation) {
                    // Mongoose error
                    logger.error('Validation error on changing user password', validation);
                    deferred.reject({
                      code: 400,
                      error: { message: validation.message }
                    });
                  } else {
                    // unknown error. log it
                    logger.error('Changing password Error', err.errors);
                    deferred.reject({
                      code: 500,
                      error: { message: 'Internal Server Error' }
                    });
                  }
                } else {
                  // Sucess
                  logger.debug('User password changed ' + user.username);
                  deferred.resolve({
                    code: 201,
                    data: data
                  });
                }
              });
            });
          });
        }
      } else {
        // Passwords do not match
        logger.info('Invalid password used change password', { username: user.username, _id: user._id.toString() });
        deferred.reject({
          code: 401,
          error: { message: 'Incorrect Username/Password' }
        });
      }
    }).catch(err => {
      // Error from argon.verify
      logger.error(err);
      deferred.reject({
        code: 500,
        error: { message: 'Internal Server error' }
      });
    });
    

    return deferred.promise
      .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
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
