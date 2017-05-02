module.exports = function(logger) {
  return {
    authHelpers: (function(logger) {
      return {
        hashPassword: function hashPassword(clearText) {

        },
        verifyPassword: function verifyPassword(hash, clear) {

        },
        generateUniqueToken: function generateUniqueToken() {
        
        }
      }
    })(logger),
    mail: (function(logger) {
      return {
        sendMail: function sendMail(params) {

        }
      }
    })(logger)
  }
};
