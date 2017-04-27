const UploaderController = require('./controllers/uploader.controller');
const ClientLoggerController = require('./controllers/client-logger.controller');
const AuthHelpers = require('./controllers/auth.helpers');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Shared([logger]) {
  let uploaderController = new UploaderController(logger);
  let clientLoggerController = new ClientLoggerController(logger);
  let authHelpers = new AuthHelpers(logger);

  return {
    uploader: uploaderController,
    clientLogger: clientLoggerController
    authHelpers: authHelpers
  };
};

module.exports = Shared;
