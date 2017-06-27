/*
 * Initialization cod for Roles module.
 */

// ---------------------------- Imports ----------------------------
var q = require('q');

var mongoose = require('mongoose');

var Roles = mongoose.model('Roles');

var path = require('path');

var config = require(path.resolve('config/config'));

var _ = require('lodash');

var Promise = q.promise;

var crypt = require('crypto');

var config = require('../config/config');

/**
 * Main Object that handles Role Module initialization.
 *
 * @param {Logger} logger The application logger.
 */
function RoleInitialization(logger) {
  /**
   * Create/Check Base role tree.
   *
   * This will ensure that a new application builds out the configured role tree. This will NOT update an existing tree if the
   * top role already exists in the tree.  This prevents overwriting changes made in the application UI.
   */
  function verifyRoleTree() {
    for (let entry = 0; entry < config.BUILD_TREE.length; entry++;) {
      Roles.count({ _id: 
    }
  }
  createInitialRole(config.ADMIN_ROLE_NAME, null, [ config.DEFAULT_ROLE_NAME ]).then(() => {
    // user
    return createInitialRole(config.DEFAULT_ROLE_NAME, config.ADMIN_ROLE_NAME);
  }).then(() => {
    logger.info('Initial roles created/exist');
  }).catch((error) => {
    logger.error('Error creating intial roles', { error: error });
  });

  /**
   * Creates Initial Roles if needed.
   *
   * @param {String}        roleName Name of the role to check for/create.
   * @param {String}        parentName Name of the roles parent role (optionial).
   * @param {Array<String>} subroles List of roles to be inherited.
   *
   * @returns {Promise} Result of the mongoose save method.
   */
  function createInitialRole(roleName, parentName, subroles=[]) {
    return Roles.count({ _id: roleName, parent: parentName }).exec().then((count) => {
      if (count < 1) {
        let newRole = new Roles({
          _id: roleName,
          parent: parentName,
          canModify: false,
          subroles: subroles
        });

        return newRole.save().then((savedRole) => {
          logger.info('Created ' + roleName + ' role');
        });
      }
    }).catch((error) => {
      logger.error('Failed to create ' + roleName + ' role');
    });
  }

  function getTopRole() {
    for (let i = 0; i < config.BUILD_TREE.length; i++) {
      
    }
  }
}
