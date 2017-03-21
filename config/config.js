/* Global configuration for 2Mean application
 *  using environment vars
 */
module.exports = {
  mongo: {
    uri: process.env.TOOMEAN_MONGO_CONNECTION_STRING || ('mongodb://' + (process.env.TOOMEAN_MONGO_HOST || 'localhost') + ':' + (process.env.TOOMEAN_MONGO_PORT || '27017') + '/' + (process.env.TOOMEAN_MONGO_DB || '2Mean_' + process.env.NODE_ENV)),
    user: process.env.TOOMEAN_MONGO_USER,
    pass: process.env.TOOMEAN_MONGO_PASS
  },
  logger: {
    level: process.env.TOOMEAN_LOG_LEVEL || 'debug',
    es: {
      aws: process.env.TOOMEAN_ES_AWS || false,
      level: process.env.TOOMEAN_ES_LEVEL || 'info',
      host: process.env.TOOMEAN_ES_HOST || undefined,
      port: process.env.TOOMEAN_ES_PORT || undefined,
      apiVersion: process.env.TOOMEAN_ES_APIVERSION || '5.0',
      consistency: false
    },
  },
  app: {  
    name: process.env.TOOMEAN_APP_NAME || 'toomean',
    host: process.env.TOOMEAN_APP_HOST || 'localhost',
    port_http: process.env.TOOMEAN_APP_PORT || 3080,
    port_https: process.env.TOOMEAN_APP_HTTPS_PORT || 3443,
    // TODO in production default to true
    force_https: process.env.TOOMEAN_APP_FORCE_HTTPS || false
  },
  uploads: {
    root: 'uploads',
    profilePicture: {
      allowedTypes: ['image/png', 'image/gif', 'image/jpeg', 'image/svg+xml'],
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
        acl: 'public-read',
        limits: {
          fileSize: 1*1024*1024
        }
      }
    }
  },
  auth: {
    //                        UPPER      lower      digit      symbol
    passwordStrengthRe: /((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!-/:-@{-~~"^_`\\\]\[])(?=.{8,}))/,
    invalidPasswordMessage: 'Password must contain one of each of the following: upper case, lower case, digit, and symbol. The password must be at least eight characters long'
  },
  aws: {
    access_key_id: process.env.AWS_ACCESS_KEY_ID,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    default_region: process.env.AWS_DEFAULT_REGION
  }
};
