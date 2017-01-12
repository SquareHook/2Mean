/* Global configuration for 2Mean application
 *  using environment vars
 */
module.exports = {
  mongo: {
    uri: 'mongodb://' + (process.env.TOOMEAN_MONGO_HOST || 'localhost') + ':' + (process.env.TOOMEAN_MONGO_PORT || '27017') + '/' + (process.env.TOOMEAN_MONGO_DB || '2Mean_' + process.env.NODE_ENV),
    user: process.env.TOOMEAN_MONGO_USER,
    pass: process.env.TOOMEAN_MONGO_PASS
  },
  logger: {
    level: process.env.TOOMEAN_LOG_LEVEL || 'info',
    es: {
      host: process.env.TOOMEAN_ES_HOST || undefined,
      port: process.env.TOOMEAN_ES_PORT || undefined,
      apiVersion: process.env.TOOMEAN_ES_APIVERSION || '5.0',
      consistency: false
    },
  },
  app: {  
    host: process.env.TOOMEAN_APP_HOST || 'localhost',
    port_http: process.env.TOOMEAN_APP_PORT || 3080,
    port_https: process.env.TOOMEAN_APP_HTTPS_PORT || 3443
  },
  uploads: {
    root: 'uploads',
    profilePicture: {
      use: process.env.TOOMEAN_UPLOADS_STRATEGY || 'local',
      local: {
        dest: './uploads/users/img/profilePicture/',
        limits: {
          fileSize: 1*1024*1024
        }
      },
      s3: {
        dest: process.env.TOOMEAN_AWS_S3_DEST_URL,
        bucket: process.env.TOOMEAN_AWS_S3_BUCKET,
        limits: {
          fileSize: 1*1024*1024
        }
      }
    }
  }
};
