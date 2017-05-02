const nodemailer = require('nodemailer');
const aws = require('aws-sdk');

const config = require('../../../../config/config');

const sesApiVersion = '2010-12-01';

const Email = require('../models/email.model');

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
      let email = new Email(params.text, params.to, params.from, params.subject);

      if (config && config.email && config.email.provider) {
        if (config.email.provider === 'ses') {
          resolve(sendMailSES(email));
        } else {
          reject(new Error('Unknown email provider: ' + config.email.provider));
        }
      }
    });
  }

  /**
   * send and email using aws-ses
   * @param {Email} email
   * @returns {Promise}
   */
  function sendMailSES(email) {
    aws.config.update({ region: config.aws.default_region });

    // create a new SES transport
    let transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: sesApiVersion
      })
    });

    // wrap callback in promise
    return new Promise((resolve, reject) => {
      // use SES transporter to send the message
      transporter.sendMail(email.asObject(), (err, info) => {
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
