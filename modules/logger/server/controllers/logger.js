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

var elasticsearch = require('elasticsearch');

/*
 * path to make resolving easier
 */
var path = require('path');

/*
 * config
 */
var config = require(path.resolve('config/config'));

/**
 * Manages the construction of the logger and returns the handle to it.
 *
 * @return {Object} The winston logger object to use.
 */
function Logger() {
  var APPLICATION_NAME = config.logger.es.appName;

  var logger;

  if (config.logger.es.host && config.logger.es.port) {
    // This is where we would look for environment 
    // variables to determine if the elasticsearch connector should be loaded.

    var client = new elasticsearch.Client({
      host: config.logger.es.host + ':' + config.logger.es.port,
      log: 'trace',
      apiVersion: config.logger.es.apiVersion
    });

    var esTransportOpts = {
      level: config.logger.es.level,
      consistency: config.logger.es.consistency,
      client: client
    };

    logger = new (winston.Logger)({
      transports: [
        new Elasticsearch(esTransportOpts)
      ],
      rewriters: [ addApplicationName ]
    });
  } else {
    logger = new (winston.Logger)({
      rewriters: [ addApplicationName ],
      transports: [
        new (winston.transports.Console)({ colorize: true })
        ]
    });
  }

  return logger;

  /**
   * A rewriter function that will add the application name to all log entries.
   */
  function addApplicationName(level, msg, meta) {
    if (!meta.appName) {
      meta.appName = APPLICATION_NAME;
    }

    return meta;
  }
};

module.exports = new Logger();
