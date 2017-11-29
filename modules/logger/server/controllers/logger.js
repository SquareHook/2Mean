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

const httpAwsEs = require('http-aws-es');

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
  var APPLICATION_NAME = config.app.name;

  var logger;

  if (config.logger.es.host && config.logger.es.port) {
    // This is where we would look for environment 
    // variables to determine if the elasticsearch connector should be loaded.
    let host = config.logger.es.host;
    let port = config.logger.es.port;
    let appLevel = config.logger.level;
    let esLevel = config.logger.es.level;
    let apiVersion = config.logger.es.api_version;
    let consistency = config.logger.es.consistency;

    let client;

    if (config.logger.es.aws &&
        config.aws.access_key_id &&
        config.aws.secret_access_key &&
        config.aws.default_region) {
      // Use aws es service. (must sign requests using http-aws-es connection class
      let accessKeyId = config.aws.access_key_id;
      let secretKey = config.aws.secret_access_key;
      let region = config.aws.default_region;

      client = new elasticsearch.Client({
        hosts: host + ':' + port,
        connectionClass: httpAwsEs,
        amazonES: {
          region: region,
          accessKey: accessKeyId,
          secretKey: secretKey
        },
        log: esLevel,
        apiVersion: apiVersion
      });
    } else {
      // use direct es connection
      client = new elasticsearch.Client({
        host: host + ':' + port,
        log: esLevel,
        apiVersion: apiVersion
      });
    }

    var esTransportOpts = {
      level: appLevel,
      consistency: consistency,
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
