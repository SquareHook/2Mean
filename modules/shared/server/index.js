const UploaderController = require('./controllers/uploader.controller');

/**
 * Top level function that wraps all of the module together to return to the application.
 */
function Shared([logger]) {
  let uploaderController = new UploaderController(logger);

  return {
    uploader: uploaderController
  };
};

module.exports = Shared;
