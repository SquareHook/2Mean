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

var md5 = require('md5');

/**
 * Main business logic for handling requests.
 */
function userProfileController(logger, shared) {
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
    let uploadConfig = {
      strategy: config.uploads.profilePicture.use,
      oldFileUrl: user.profileImageURL,
      req: req,
      res: res
    };

    return new Promise((resolve, reject) => {
      if (isAuthorized(user, 'update')) { 
        if (uploadConfig.strategy === 's3') {
          uploadConfig.s3 = config.uploads.profilePicture.s3;
        } else if (uploadConfig.strategy === 'local') {
          uploadConfig.local = config.uploads.profilePicture.local;
          uploadConfig.local.apiPrefix = '/api/users/' + user._id + '/picture/';
        } else {
          throw new Error('unknown strategy');
        }

        return Users.findById(user._id).exec().then((foundUser) => {
          if (foundUser) {
            resolve(shared.uploader.upload(uploadConfig).then((url) => {
              foundUser.profileImageURL = url;
              return foundUser.save();
            }));
          } else {
            throw new Error('not found');
          }
        });
      } else {
        throw new Error('forbidden');
      }
    })
    .then((savedUser) => {
      res.status(200).send(savedUser);
    })
    .catch((error) => {
      if (error.message === 'unknown strategy') {
        logger.error(error.message + ' for profile picture upload');
        res.status(500).send();
      } else if (error.message === 'forbidden') {
        res.status(403).send();
      } else if (error.message === 'not found') {
        res.status(404).send();
      } else if (error.name === 'ValidationError') {
        res.status(400).send(error.message);
      } else {
        logger.error(error);
        res.status(500).send();
      }
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
