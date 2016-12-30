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

/**
 * Main business logic for handling requests.
 */
function userController(logger) {
  // --------------------------- Public Function Definitions ----------------------------

  /**
   * Reads a user from the database if the permissions are adequate.
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

  function create() {
  }

  function update() {
  }

  function deleteUser() {
  }

  // --------------------------- Private Function Definitions ----------------------------
  
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

  // --------------------------- Revealing Module Section ----------------------------

  return {
    read        : read,
    create      : create,
    update      : update,
    deleteUser  : deleteUser
  };
}

module.exports = userController;
