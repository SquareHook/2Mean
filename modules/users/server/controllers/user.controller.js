/**
 * Database handle.
 */
var mongoose = require('mongoose');

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
 * application config
 */
var config = require('../../../../config/config');

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
    newUser.roles = [ 'user' ];

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
          logger.error('Creating User Error', err.errors);
          deferred.reject({
            code: 500,
            error: 'Internal Server Error'
          });
        }
      } else {
        logger.info('User created: ' + newUser.username);
        deferred.resolve({
          code: 201,
          data: data
        });
      }

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

      findUserByEmail(existingUser.email)
        .then((modifiedUser) => {
          var keys = Object.keys(existingUser._doc);

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
    var user = req.user;
    var profileUploadFileFilter = undefined;
    
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
        })
      }).single('file');
      url = config.uploads.profilePicture.s3.dest + fileName;
    } else if (config.uploads.profilePicture.use == 'local') {
      upload = multer(config.uploads.profilePicture.local).single('file');
      url = config.uploads.profilePicture.local.dest + fileName;
    }

    if (isAuthorized(user, 'update')) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          logger.error(uploadError);
          return res.status(400).send({
            message: 'Error occurred while uploading profile picture'
          });
        } else {
          user.profileImageURL = url;

          user.save((err, data) => {
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
    var index;

    for(index in Object.keys(user._doc)) {
      let realIndex = Object.keys(user._doc)[index];
      if (body[realIndex]) {
        user[realIndex] = body[realIndex];
      }
    }

    user.updated = new Date();
    user.created = new Date();

    return user;
  }

  // --------------------------- Revealing Module Section ----------------------------

  return {
    read                  : read,
    create                : create,
    update                : update,
    deleteUser            : deleteUser,
    register              : register,
    changeProfilePicture  : changeProfilePicture
  };
}

module.exports = userController;
