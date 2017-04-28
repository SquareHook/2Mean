const nodemailer = require('nodemailer');
const aws = require('aws-sdk');

const config = require('../../../../config/config');

const sesApiVersion = '2010-12-01';

function MailController(logger) {
  const knownProviders = [
    'ses'
  ];

  /**
   * send and email using aws-ses
   * @param {Object} params
   * @param {String} params.text - text of email
   * @param {String} params.from - email sent from
   * @param {String} params.to - email sent to
   * @param {String} params.subject - subject of email
   * @returns {Promise}
   */
  function sendMail(params) {
    return new Promise((resolve, reject) => {
      if (config && config.email && config.email.provider) {
        if (config.email.provider === 'ses') {
          resolve(sendMailSES(params));
        } else {
          reject(new Error('Unknown email provider: ' + config.email.provider));
        }
      }
    });
  }

  /**
   * send and email using aws-ses
   * @param {Object} params
   * @param {String} params.text - text of email
   * @param {String} params.from - email sent from
   * @param {String} params.to - email sent to
   * @param {String} params.subject - subject of email
   * @returns {Promise}
   */
  function sendMailSES(params) {
    // create a new SES transport
    let transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: sesApiVersion
      })
    });

    // wrap callback in promise
    return new Promise((resolve, reject) => {
      // use SES transporter to send the message
      transporter.sendMail(params, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }

  return {
    sendMail: sendMail
  }
}

module.exports = MailController;
