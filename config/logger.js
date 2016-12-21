/**
 * The logger library.
 *
 * @var {Object}
 */
var winston = require('winston');

/**
 * The logger connector to elasticsearch.
 *
 * @var {Object}
 */
var Elasticsearch = require('winston-elasticsearch');

/**
 * Manages the construction of the logger and returns the handle to it.
 *
 * @return {Object} The winston logger object to use.
 */
function Logger() {
  var esTransportOpts = {
    level: 'info'
  };

  var logger;

  if (null) {
    // This is where we would look for environment variables to determine if the elasticsearch connector should be loaded.
    logger = new winston.Logger({
      transports: [
        new Elasticsearch(esTransportOpts)
      ]
    });
  } else {
    // Just load a dev logger.
    logger = winston;
  }

  return logger;
};

module.exports = new Logger();
