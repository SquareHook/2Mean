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
 */
function authenticationModule(logger) {
  passport.use(new DigestStrategy(
    (username, done) => {

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

      return done(null, {name: 'Bob'}, 'fiddlesticks');
    },
    /**
     * Nounce key checking TODO here.
     */
    (params, done) => {
      done(null, true);
    }
  ));
};

module.exports = authenticationModule;
