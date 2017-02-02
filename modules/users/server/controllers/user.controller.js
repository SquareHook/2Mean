
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
 * Multer multipart form data  (for files)
 */
var multer = require('multer');

/*
 * multers3 for piping multer data directly to s3
 */
var multerS3 = require('multer-s3');

/*
 * aws aws-sdk toolkit
 */
var aws = require('aws-sdk');

/*
 * uuid for generating good random names for files
 */
var uuid = require('uuid');

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

/**
 * Main business logic for handling requests.
 */
function userController(logger) {
  // --------------------------- Public Function Definitions ----------------------------

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

    let newUser = mapUser(body);

    // Overwrite any roles set or make sure they get set appropriately.
    newUser.role = 'user';

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
              if (code === 11000 && false) {
                // TODO implement email-password login and registration
                // confirmation emails. Otherwise usernames could be enumerated
                // with this endpoint. Until then send back generic error
                // message
                deferred.reject({
                  code: 500, 
                  error: 'Username is taken'
                });
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

    return deferred.promise
      .then((data) => {
        res.status(data.code).send(data.data);
      }, (error) => {
        res.status(error.code).send(error.error);
      });
  }

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
          w
          logger.error('User Module Error: Reading User from Database', error);
          res.status(500).send('Error retrieving user information');
        });
    } else {
      return res.status(401).send('Unauthorized');
    }
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
                  data: data
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
   * @param {Request} req   The Express request object.
   * @param {Response} res  The Express response object.
   * @param {Next} next     The Express next (middleware) function.
   *
   * @return {void}
   */
  function deleteUser(req, res, next) {
    var userId = req.params.userId;

    if (isAuthorized(user, 'delete')) {
      Users.findOne({_id: userId}).remove((err, data) => {
        if (err) {
          logger.error('Error removing user', err);

          res.status(500).send('Internal Server Error');
        } else {
          res.status(200).send('User Deleted');
        }
      });
    }
  }

  /*
   * updates any users with parentRole as their role
   * to put subroles as their subroles
   */
   function flushSubroles(parentRole, subroles)
   {
      logger.info("Updating user subroles");
      logger.info(parentRole);
      logger.info(["banana", "pajama"]);
      logger.info(subroles);
      Users.update({role: parentRole}, {$set: {subroles: subroles}},{multi: true}, (err, data) =>
      {
        if(err)
        {
          logger.error("error updating subroles for affected users", err.errmsg)
        }
      });
   }

  /**
   * Handle post requests with multer picture
   *  should respond with the updated user model (including new picture url)
   *
   * @param {Request}   req   The express request object
   * @param {Response}  res   The express response object
   * @param {Next}      next  The express (middleware) function
   *
   * @return {void}
   */
  function changeProfilePicture(req, res, next) {
    // get user from request
    var user = req.user;

    // save old image uri so it can be removed if save works
    var re = /\/[^\/]*$/;
    var start = user.profileImageURL.search(re);
    // start 1 after to remove slash from file name
    var oldFileName = user.profileImageURL.slice(start+1);

    if (oldFileName.length === 0) {
      // no old url
      oldFileName = undefined;
      logger.warning('Old url did not exist while changing user profile picture');
    }
    
    var deferred = q.defer();

    //use uuid timestamp based id
    var fileName = uuid.v1();
    var upload;
    var url;

    if (config.uploads.profilePicture.use == 's3') {
      var s3 = new aws.S3();
      upload = multer({
        storage: multerS3({
          s3: s3,
          bucket: config.uploads.profilePicture.s3.bucket,
          acl: 'public-read',
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            cb(null, fileName);
          }
        }),
        fileFilter: profilePictureFileFilter,
        limits: config.uploads.profilePicture.s3.limits
      }).single('file');

      // s3 file acessed directly from aws
      url = config.uploads.profilePicture.s3.dest + fileName;
    } else if (config.uploads.profilePicture.use == 'local') {
      upload = multer({
        storage: multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, config.uploads.profilePicture.local.dest);
          },
          filename: function (req, file, cb) {
            cb(null, fileName);
          }
        }),
        fileFilter: profilePictureFileFilter,
        limits: config.uploads.profilePicture.local.limits
      }).single('file');

      // local files accessed through api
      url = '/api/users/' + user._id + '/picture/' + fileName;
    } else {
      logger.error('Upload strategy unknown', config.uploads.profilePicture.use);
      //TODO is there a server config error code?
      res.status(400).send('Server Configuration Error: Upload strategy unknown');
    }

    //TODO pretty sure this is hitting a stub
    if (isAuthorized(user, 'update')) {
      // use the multer upload object
      upload(req, res, function (err) {
        if (err) {
          logger.error(err);

          return res.status(400).send({
            message: 'Error occurred while uploading profile picture'
          });
        } else {
          // on successful upload we should change the user's imageUrl in
          // the database
          user.profileImageURL = url;

          user.save((err, data) => {
            if (err) {
              logger.error('Error updating user', err);

              deferred.reject({
                code: 500,
                error: 'Internal Server Error'
              });
            } else {
              if (config.uploads.profilePicture.use == 'local') {
                // fs uses unlink to delete files
                // delete old profile picture
                fs.unlink(path.resolve(config.uploads.profilePicture.local.dest, oldFileName),
                  () => {
                    logger.debug('Old profile picture deleted');
                  });
              } else if (config.uploads.profilePicture.use === 's3') {
                // s3 sdk sends a delete request to the aws-s3 api
                var params = {
                  Bucket: config.uploads.profilePicture.s3.bucket,
                  Key: oldFileName
                };

                s3.deleteObject(params, function(err, data) {
                  if (err) {
                    // this will need to be logged and resolved to prevent
                    // cluttering of s3 resources
                    // AKA use elasticsearch/kibana logger config
                    // to stay aware of this kind of event and fix it
                    logger.error('Error while deleting object on s3', err);
                  } else {
                    logger.debug('Old profile picture deleted');
                  }
                });
              }
              deferred.resolve({
                code: 200,
                data: data
              });
            }
          });
        }
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
   * Sends a user's profile picture if the local strategy is being used
   *
   * @param {Request}   req   The Express request object
   * @param {Response}  res   The Express response object
   * @param {Next}      next  The Express next (middleware) function
   *
   * @returns {void}
   */
  function getProfilePicture(req, res, next) {
    // local strategy stores image on filesystem
    // s3 strategy serves direct urls
    if (config.uploads.profilePicture.use !== 'local') {
      res.status(400).send('Local strategy not in use');
    }

    var userId = req.params.userId;
    var fileName = req.params.fileName;

    Users.findOne({_id: userId})
      .then((user) => {
        var url = user.profileImageURL;
        var serveUrl = path.resolve('uploads/users/img/profilePicture/' + fileName);

        // if filename exists
        if (serveUrl.length !== 0) {
          res.status(201).sendFile(serveUrl);
        } else {
          logger.error('Filename does not exist');
          res.status(400).send('Error retrieving file');
        }
      }, (error) => {
        res.status(500).send('Error retrieving user information');
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
   *
   */
  function findUserByEmail(emailAddress) {
    return Users.findOne({email: emailAddress});
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
    if (_.indexOf(user.roles, 'admin')) {
      return true;
    }

    return false;
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

    user._id = body.id;
    user.updated = new Date();
    user.created = new Date();

    return user;
  }

  /*
   * checks the file is valid
   *  fileSize is handled by multer using limits property of config
   *  object.
   *  type is handled here
   */
  function profilePictureFileFilter (req, file, cb) {
    // get config
    var allowedTypes = config.uploads.profilePicture.allowedTypes;
    var fileType = file.mimetype;

    if (!allowedTypes.includes(fileType)) {
      logger.debug('file uploaded is invalid');
      cb(null, false);
    } else {
      logger.debug('file uploaded is valid');
      cb(null, true);
    }
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

  // --------------------------- Revealing Module Section ----------------------------

  return {
    read                  : read,
    create                : create,
    update                : update,
    deleteUser            : deleteUser,
    register              : register,
    changeProfilePicture  : changeProfilePicture,
    getProfilePicture     : getProfilePicture,
    changePassword        : changePassword,
    flushSubroles         : flushSubroles
  };
}

module.exports = userController;
