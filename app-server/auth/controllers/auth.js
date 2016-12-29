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

/**
 * Main business logic for handling requests.
 */
function authenticationModule(logger) {
  // Key, 8 hours TTL
  var keyTTL = 1000 * 60 * 60 * 8;

  function validateAPIKey(req, res, next) {
    if (!req.cookies || !req.cookies.apikey) {
      return res.status(400).send('Unauthorized');
    }

    Keys.findOne({value: req.cookies.apikey})
      .then((data) => {
        // TODO: Look up user and serve it back.
        req.auth = data;
        Users.findOne({_id: data.user})
          .then((user) => {
            return next(null, user);
          }, (err) => {
            if (err) {
              logger.error(err);
            }
          });
      }, (error) => {
        logger.error('Authentication error looking up a key', error);
        return res.status(400).send('Unauthorized');
      });
  }

  // Check if Database has been populated yet.  If not, inject default user.
  Users.count({}, (err, c) => {
    if (c < 1) {
      let newUser = new Users();
      logger.info('Users collection is empty, adding default user...');

      newUser.firstName = 'Admin';
      newUser.lastName = 'User';
      newUser.displayName = 'Squarehook';
      newUser.email = 'support@squarehook.com';
      newUser.username = 'squarehook';
      newUser.password = '12345';
      newUser.roles = [ 'user', 'admin' ];

      newUser.save((err, data) => {
        if (err) {
          logger.error(err);
        }
      });
    }
  });


  /**
   * The main login logic.
   */
  function login(req, res, next) {
    var deferred = q.defer();
    var creds = req.body;

    if (!creds.username || !creds.password) {
      deferred.reject({
        code: 400,
        error: 'Username or Password missing!'
      });
    } else {
      Users.findOne({username: creds.username})
        .then((user) => {
          // Create new key (even if valid one exists).
          let key = new Keys();

          let apikey = {
            value: createKey(16),
            created: new Date()
          };

          // Remove the old key from the Keys collection.
          if (user.apikey && user.apikey.value) {
            Keys.findOne({value: user.apikey.value})
              .then((data) => {
                data.remove();
              }, (err) => {
                logger.error('Error finding old key to remove', err);
              });
          }

          user.apikey.value = apikey.value;
          user.apikey.created = apikey.created;

          user.save((err, data) => {
            if (err) {
              logger.error(err);
            }
          });

          key.value = apikey.value;
          key.created = apikey.created;
          key.user = user._id;
          key.roles = user.roles;

          key.save((err, data) => {
            if (err) {
              logger.error(err);
            }
          });

          deferred.resolve({
            code: 200,
            data: {
              apikey: user.apikey.value
            }
          });
        }, (error) => {
          logger.error('Auth Module error: Hit error querying for user.', error);

          deferred.reject({
            code: 500,
            error: 'Error retrieving user information.'
          });
        });
    }

    deferred.promise.then((data) => {
      // TODO !!!! This needs to be set to environment vars.
      res.cookie('apikey', data.data.apikey, {
        expires: new Date(Date.now() + keyTTL),
        domain: 'localhost'
      });

      res.status(data.code).send(data.data);
    }, (error) => {
      res.status(error.code).send(error.error);
    });
  }

  /**
   * Given a key object, checks that it is still a valid key or not.
   *
   * @param {object} key The key object from the user model.
   *
   * @return {boolean}
   */
  function isKeyExpired(key) {
    var timeElapsed;

    if (!key) {
      return true;
    }

    timeElapsed = (new Date()).getTime() - key.created.getTime();

    // Check if key is expired.
    if (timeElapsed > keyTTL) {
      return true;
    }

    return false;
  }

  /**
   * Generates a key of specified length.
   *
   * @param {number} len The length of the key to generate.
   *
   * @return {string} The key.
   */
  function createKey(len) {
    var buf = []
      , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
      buf.push(chars[Math.random() * charlen | 0]);
    }

    return buf.join('');
  };

  function getUserInfo(req, res, next) {

  }

  return {
    login: login,
    getUserInfo: getUserInfo,
    validateAPIKey: validateAPIKey
  }
};

module.exports = authenticationModule;
