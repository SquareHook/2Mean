/**
 * Database handle.
 */
var mongoose = require('mongoose');

/**
 * User model.
 */
var Users = mongoose.model('User');

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
const config = require('../../../../config/config');

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
  async function changeProfilePicture(req, res, next) {
    // get user from request
    var user = req.user;
    let uploadConfig = {
      strategy: config.uploads.profilePicture.use,
      oldFileUrl: user.profileImageURL,
      req: req,
      res: res
    };

    // the request should only (at the moment) ever change the current user's
    // profile picture so there is no need to check if the user is authorized
    
    if (uploadConfig.strategy === 's3') {
      uploadConfig.s3 = config.uploads.profilePicture.s3;
    } else if (uploadConfig.strategy === 'local') {
      uploadConfig.local = config.uploads.profilePicture.local;
      uploadConfig.local.apiPrefix = '/api/users/' + user._id + '/picture/';
    } else {
      return res.status(500).send();
    }

    try {
      foundUser = await Users.findById(user._id).exec();
    } catch (error) {
      return res.status(500).send();
    } 

    if (foundUser) {
      try {
        url = await shared.uploader.upload(uploadConfig);
      } catch (error) {
        return res.status(500).send();
      }
    } else {
      return res.status(404).send();
    }
    
    foundUser.profileImageURL = url;

    try {
      savedUser = await foundUser.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).send(error.message);
      } else {
        res.status(500).send();
      }
    }
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
  async function getProfilePicture(req, res, next) {
    // local strategy stores image on filesystem
    // s3 strategy serves direct urls
    if (config.uploads.profilePicture.use !== 'local') {
      return res.status(400).send('Local strategy not in use');
    }

    var userId = req.params.userId;
    var fileName = req.params.fileName;

    let user;
    try {
      user = await Users.findOne({_id: userId});
    } catch (error) {
      return res.status(500).send('Error retrieving user information');
    }
        
    var url = user.profileImageURL;
    var serveUrl = path.resolve('uploads/users/img/profilePicture/' + fileName);

    return res.status(200).sendFile(serveUrl);
  }
  
  // --------------------------- Revealing Module Section ----------------------------

  return {
    changeProfilePicture  : changeProfilePicture,
    getProfilePicture     : getProfilePicture
  };
}

module.exports = userProfileController;
