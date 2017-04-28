const UploaderController = require('./controllers/uploader.controller');
const ClientLoggerController = require('./controllers/client-logger.controller');
const AuthHelpers = require('./controllers/auth.helpers');
const MailController = require('./controllers/mail.controller');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Shared([logger]) {
  let uploaderController = new UploaderController(logger);
  let clientLoggerController = new ClientLoggerController(logger);
  let authHelpers = new AuthHelpers(logger);
  let mailController = new MailController(logger);

  return {
    uploader: uploaderController,
    clientLogger: clientLoggerController,
    authHelpers: authHelpers,
    mail: mailController
  };
};

module.exports = Shared;
