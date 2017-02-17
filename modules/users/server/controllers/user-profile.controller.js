/**
 * Database handle.
 */
var mongoose = require('mongoose');

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
 * application config
 */
var config = require(path.resolve('config/config'));

/**
 * Main business logic for handling requests.
 */
function userProfileController(logger) {
  // --------------------------- Public Function Definitions ----------------------------
  const pageLimit = 25;
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
  // --------------------------- Private Function Definitions ----------------------------

  /*
   * Verfies the user is authorized to make changes.
   *
   * TODO: This could probably be more robust.
   */
  function isAuthorized(user, action) {
    if (_.indexOf(user.role, 'admin')) {
      return true;
    }

    return false;
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

  // --------------------------- Revealing Module Section ----------------------------

  return {
    changeProfilePicture  : changeProfilePicture,
    getProfilePicture     : getProfilePicture
  };
}

module.exports = userProfileController;
