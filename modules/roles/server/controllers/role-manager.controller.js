/*
 * Role Manager
 *
 * Used by the Route Loader to enforce role policies on all API endpoints.
 */

/**
 * 3rd party dependencies.
 */
var q = require('q');
var _ = require('lodash');
var Promise = q.promise;
var crypt = require('crypto');


var mongoose = require('mongoose');

var config = require('../config/config');

/**
 * The Roles model.
 */
var Roles = mongoose.model('Roles');

/**
 * Application configuration data.
 */
var appConfig = require('../../../../config/config');

/**
 * The role manager which enforces role policies at a core level (if enabled).
 *
 * @param {Logger} logger The application logger.
 */
function roleManager(logger)
{
  /**
   * Checks if the given user has access to the provided asset.
   *
   * @param {String} role       The id for the user to check.
   * @param {String} assetHash  The identifier for the endpoint.
   *
   * @return {Promise<Boolean>}
   */
  function checkPolicy(role, assetHash) {
    return new Promise((resolve, reject) => {
      // Only enforce role policies if configuration is set to.
      if (!appConfig.app.enableRoleManager) {
        resolve(true);
        return;
      }

      Roles.find({'permissions.asset': assetHash})
        .exec()
        .then((data) => {
          logger.info(data);
        })
        .catch((err) => {
          logger.error(err);
        });
    });
  }

  /**
   * Given the json configuration for a route, this returns the hash for it.
   *
   * @param {Object} route The json config data for the endpoint.
   *
   * @returns {String} The hash representation for the endpoint.
   */
  function getEndpointHash(route) {
    var hash = crypt.createHash('sha256');
    hash.update(JSON.stringify(route));

    return hash.digest('hex');
  }

  /**
   * Checks for access to the asset given a user and the asset hash.
   *
   * @param {String}     hash The hash to the asset.
   * @param {String}     role The role to check policy for.
   * @param {Response}   res  The Express next function.
   * @param {Function}   next The Express next function.
   *
   * @returns {Boolean}
   */
  function validateAccess(hash, role, res, next) {
    return new Promise((resolve, reject) => {
      if (role === 'admin') {
        console.log('Admin Allowed');
        resolve(true);
        return;
      }

      Roles.find({_id: role, 'permissions.asset': hash})
        .exec()
        .then((roleList) => {
          // Not a valid role for this asset.
          if (roleList.length < 1) {
            console.log('Denied');
            resolve(false);
            return;
          } else {
            // Found a match.
            resolve(true);
            return;
          }
        });
    });
  }

  /**
   * Gets the status of the role manager with the application.
   *
   * @returns {Boolean}
   */
  function isEnabled() {
    return appConfig.app.enableRoleManager;
  }

  /**
   * Used for pruning details from the endpoint config.
   *
   * @param {object} endpointDetails The JSON config object for a given endpoint.
   *
   * @returns {object} A modified version of the JSON object, filtered by the ENDPOINT_DETAIL_LIST.
   */
  function pruneEndpointDetails(endpointDetails) {
    let updatedEndpointDetails = {};

    let endpoint_fields = config.ENDPOINT_DETAIL_LIST;

    for (let i = 0; i < endpoint_fields.length; i++) {
      if (endpointDetails[endpoint_fields[i]]) {
        updatedEndpointDetails[endpoint_fields[i]] = endpointDetails[endpoint_fields[i]];
      }
    }

    return updatedEndpointDetails;
  }
    
  return {
    checkPolicy          : checkPolicy,
    isEnabled            : isEnabled,
    getEndpointHash      : getEndpointHash,
    validateAccess       : validateAccess,
    pruneEndpointDetails : pruneEndpointDetails
  }
}

module.exports = roleManager;
