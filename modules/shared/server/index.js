const UploaderController = require('./controllers/uploader.controller');
const AuthHelpers = require('./controllers/auth.helpers');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Shared([logger]) {
  let uploaderController = new UploaderController(logger);
  let authHelpers = new AuthHelpers(logger);

  return {
    uploader: uploaderController,
    authHelpers: authHelpers
  };
};

module.exports = Shared;
