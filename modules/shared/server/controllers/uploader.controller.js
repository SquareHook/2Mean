const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const confit = require(path.resolve('config/config'));

function uploadController(logger) {
  /**
   * Uploads a file using the local strategy
   * @param {Object} config - same as config object passed to upload
   * @param {Object} config.local - strategy specific options
   * @param {string} config.local.dest - directory to upload relative to project root
   * @param {string} config.local.apiPrefix - api endpoint where file will be served from (no file name)
   * @returns {Promise} will resolve to the file's url
   */
  function uploadLocal(config) {
    // init the multer object
    let upload = multer({
      storage: multer.diskStorage({
        // callback for setting up the destination
        destination: (req, file, cb) => {
          cb(null, config.local.dest);
        },
        // callback for setting up the name of the file
        filename: (req, file, cb) => {
          cb(null, config.newFileName);
        }
      }),
      fileFilter: config.fileFilter,
      limits: config.local.limits
    }).single('file');

    // the api url to access the file from
    let url = config.local.apiPrefix + config.newFileName;

    return new Promise((resolve, reject) => {
      // use the multer object
      upload(config.req, config.res, (err) => {
        if (err) {
          logger.error(err);
          reject(new Error('Error while uploading with local strategy'));
        } else {
          resolve(url);
        }
      });
    })
    .then((newUrl) => {
      return new Promise((resolve, reject) => {
        // check if old file needs to be deleted
        if (config.oldFileName) {
          // fs.unlink aka delete
          fs.unlink(path.resolve(config.local.dest, config.oldFileName), (err) => {
            if (err) {
              logger.error('Error while deleting object locally', err);
              // resolve anyway (may leave an orphaned file but ENOENT could
              // have come from the old file being in a different domain
              resolve(newUrl);
            } else {
              logger.debug('Old file deleted locally');
              resolve(newUrl);
            }
          });
        } else {
          resolve(newUrl);
        }
      });
    });
  }

  /**
   * Uploads a file using the s3 strategy
   * @param {Object} config - same as config object passed to upload
   * @param {Object} config.s3 - strategy specific options
   * @param {string} config.s3.bucket
   * @param {string} config.s3.dest
   * @returns {Promise} will resolve to the file's url
   */
  function uploadS3(config) {
    // set up the aws object
    let s3 = new aws.S3();

    // set up the multer object
    let upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: config.s3.bucket,
        acl: config.s3.acl,
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname })
        },
        key: (req, file, cb) => {
          cb(null, config.newFileName);
        }
      }),
      fileFilter: config.fileFilter,
      limits: config.s3.limits
    }).single('file');

    // aws url
    let url = config.s3.dest + config.newFileName;
    
    return new Promise((resolve, reject) => {
      // use the multer object
      upload(config.req, config.res, (err) => {
        if (err) {
          logger.error(err);
          throw new Error('Error while uploading with s3 strategy');
        } else {
          resolve(url);
        }
      });
    })
    .then((newUrl) => {
      return new Promise((resolve, reject) => {
        // possibly try to remove old file
        if (config.oldFileName) {
          const params = {
            Bucket: config.s3.bucket,
            Key: config.oldFileName
          };

          s3.deleteObject(params, (err, data) => {
            if (err) {
              logger.error('Error while deleting object on s3', err);
              throw err;
            } else {
              logger.debug('Old file deleted deleted from s3');
              resolve(newUrl);
            }
          });
        } else {
          resolve(newUrl);
        }
      });
    });
  }
  
  /**
   * Use one of the above upload strategies to upload a file
   * @param {Object} config
   * @param {string} oldFileURL - if replacing a file, defining this will delete the old file on success
   * @param {string} newFileName - if defined file will be called this. Otherwise it gets a random name
   * @returns {Promise} will resolve to the file's url
   */
  function upload(config) {
    /* matches the last chunk of a url
     * example:
     *  /api/somewhere/blah/blah/blah/file.png
     *  will match file.png
     */
    const fileNameRegEx = /\/[^\/]*$/;

    let oldFileName;
    let newFileName = config.newFileName || uuid.v1();

    if (config.oldFileUrl) {
      let start = config.oldFileUrl.search(fileNameRegEx);
      // strip / from file name
      oldFileName = config.oldFileUrl.slice(start + 1);
    }

    config.newFileName = newFileName;
    config.oldFileName = oldFileName;

    return new Promise((resolve, reject) => {
      // using this.upload<Strategy> because it makes stubbing possible
      // otherwise the actual function will be used
      if (config.strategy === 's3') {
        resolve(this.uploadS3(config));
      } else if (config.strategy === 'local') {
        resolve(this.uploadLocal(config));
      } else {
        reject(new Error('Configuration error: unknown upload startegy'));
      }
    });
  }

  return {
    upload,
    uploadLocal,
    uploadS3,
    // dummy route for making module loader work. TODO maybe use this to respond with info about files
    fileInfo: () => {}
  }
}

module.exports = uploadController;
