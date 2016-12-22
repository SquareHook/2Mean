var passport = require('passport');
var DigestStrategy = require('passport-http').DigestStrategy;

function authenticationModule(logger) {
  passport.use(new DigestStrategy(
    (username, done) => {
      logger.info('Auth request');
      logger.info(username);

      return done(null, {name: 'Bob'}, 'fiddlesticks');
    },
    (params, done) => {
      logger.info('Nounce key request');
      logger.info(params);

      done(null, true);
    }
  ));
};

module.exports = authenticationModule;
