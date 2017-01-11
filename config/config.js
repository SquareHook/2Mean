/* Global configuration for 2Mean application
 *  using environment vars
 */
module.exports = {
    mongo: {
        uri: 'mongodb://' + (process.env.TOOMEAN_MONGO_HOST || 'localhost') + ':' + (process.env.TOOMEAN_MONGO_PORT || '27017') + '/' + (process.env.TOOMEAN_MONGO_DB || '2Mean_' + process.env.NODE_ENV),
        user: process.env.TOOMEAN_MONGO_USER,
        pass: process.env.TOOMEAN_MONGO_PASS
    },
    es: {
        host: process.env.TOOMEAN_ES_HOST || undefined,
        port: process.env.TOOMEAN_ES_PORT || undefined
    },
    app: {
        host: process.env.host || 'localhost',
        port_http: process.env.port_http || 3080,
        port_https: process.env.port_https || 3443
    },
    uploads: {
      root: 'uploads',
      profilePicture: {
        use: 's3',
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
