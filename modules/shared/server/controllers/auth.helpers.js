/**
 * Helpers for auth mechanisms
 */

// password hasher
const argon2 = require('argon2');

// unique string generator
const uuid = require('uuid');

const config = require('../../../../config/config');

let AuthHelpers = function () {
  /**
   * hashes the plaintext password
   * @param {String} clearText
   * @returns {Promise}
   */
  function hashPassword(clearText) {
    return argon2.generateSalt().then((salt) => {
      return argon2.hash(clearText, salt);
    });
  }

  /**
   * verifies the plaintext password is valid
   * @param {String} hash
   * @param {String} plainText
   * @returns {Promise}
   * argon2.verify returns a promise like object. Wrapping it in a real
   * promise will prevent some weirdness in testing
   */
  function verifyPassword(hash, plainText) {
    return new Promise((resolve, reject) => {
      argon2.verify(hash, plainText).then((match) => {
        resolve(match);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * generates a unique token for use in email verification and password
   * reset verification
   * @returns {String}
   */
  function generateUniqueToken() {
    return uuid.v4();
  }

  /**
   * generates a url that can be accessed directly throught a link
   * in an email
   */
  function generateUrl() {
    let url;

    // if the app is behind a proxy, use the config url
    if (config.app.proxyUrl) {
      url = config.app.proxyUrl;
    } else {
      // if node is serving over TLS, give an https url
      if (config.app.force_https) {
        url = 'https://' + config.app.host + (config.app.port_https !== '443' ? ':' + config.app.port_https : '');
      } else {
        url = 'http://' + config.app.host + (config.app.port_http !== '80' ? ':' + config.app.port_http : '');
      }
    }

    return url;
  }

  return {
    hashPassword: hashPassword,
    verifyPassword: verifyPassword,
    generateUniqueToken: generateUniqueToken,
    generateUrl: generateUrl
  }
}

module.exports = AuthHelpers;
