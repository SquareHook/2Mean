/**
 * Authentication library.
 */
var passport = require('passport');

/**
 * Authentication Strategy.
 */
var DigestStrategy = require('passport-http').DigestStrategy;

/**
 * Database handle.
 */
var mongoose = require('mongoose');

/**
 * User model.
 */
var Users = mongoose.model('User');

/**
 * Main business logic for handling requests.
 *
 * TODO: The realm needs to be set in environment.
 *
 * TODO: Make sure domain doesn't limit protected areas.
 */
function authenticationModule(logger) {
  passport.use(new DigestStrategy(
    {
      realm: 'toomean',
      domain: [],
      algorithm: 'MD5',
      qop: 'auth'
    },
    (username, done) => {

      if (username === 'squarehook') {
        return done(null,
            {
              firstName: 'Admin',
              lastName: 'User',
              displayName: 'Squarehook',
              email: 'support@squarehook.com',
              username: 'squarehook',
              roles: [ 'user', 'admin' ]
            },
            '12345')
      }

      Users.findOne({username: username})
        .then((user) => {
          if (!user) {
            logger.info('User does not exist');
            done(null, false);
          } else {
            logger.info('Found user');
            done(null, user, user.password);
          }
        }, (error) => {
          logger.error('User Lookup Error: ', error);
          done(error);
        });
    },
    /**
     * Nounce key checking TODO here.
     */
    (params, done) => {
      done(null, true);
    }
  ));

  function getUserInfo(req, res, next) {

  }

  return {
    getUserInfo: getUserInfo
  }
};

module.exports = authenticationModule;
