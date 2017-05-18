const uutPath = '../controllers/mail.controller';
const configPath = '../../../../config/config';

/* Testbench */
const q = require('q');
const chai = require('chai');
const should = chai.should();
chai.config.includeStack = true;

const sinon = require('sinon');

const mockLogger = require('./testbench/mock-logger');

const aws = require('aws-sdk');
const nodemailer = require('nodemailer');

const proxyquire = require('proxyquire');

let configStub = {
  email: {
  },
  aws: {
  }
};

describe('MailController', () => {
  let mailController;

  /**
   * test the sendMail method
   */
  describe('#sendMail', () => {
    const mockParams = {
      from: 'test@example.com',
      subject: 'test',
      text: 'test message',
      to: 'test@example.com'
    };

    const sendMailInfo = 'I\'m some info weeee!';

    /**
     * test the aws-ses transport
     * uses nodemailer
     */
    describe('SES', () => {
      const apiVersion = '2010-12-01';

      let createTransportStub, mockTransport, sesStub, mockSES;

      beforeEach(() => {
        // set config to use SES provider
        configStub.email.provider = 'ses';
        configStub.aws.ses = {
          enabled: true,
          from: 'test@example.com'
        };

        mailController = proxyquire(uutPath, {
          '../../../../config/config': configStub
        })(mockLogger);

        mockTransport = {
          sendMail: new sinon.stub()
        };

        mockSES = {};
        
        createTransportStub = sinon.stub(nodemailer, 'createTransport');
        createTransportStub.returns(mockTransport);

        sesStub = new sinon.stub(aws, 'SES');
        sesStub.returns(mockSES);
      });

      afterEach(() => {
        createTransportStub.restore();
        sesStub.restore();
      });

      /**
       * make the sendMail stub resolve. This gets done for most test cases
       */
      function sendMailResolves() {
        mockTransport.sendMail.callsArgWith(1, null, sendMailInfo);
      }

      it('should use nodemailer.createTransport', () => {
        // should be called oce with the results of the ses constructor
        // this has been mocked out with mockSES
        const createTransportArgs = [ [ { SES: mockSES } ] ];
        sendMailResolves();

        return mailController.sendMail(mockParams).then((data) => {
          createTransportStub.args.should.deep.equal(createTransportArgs);
        });
      });

      it('should use the aws.SES constructor', () => {
        // should be called once with the api version
        const sesArgs = [ [ { apiVersion: apiVersion } ] ];
        sendMailResolves();

        return mailController.sendMail(mockParams).then((data) => {
          sesStub.args.should.deep.equal(sesArgs);
        });
      });

      it('should use transport.sendmail', () => {
        const sendMailArgs = [ mockParams ];
        sendMailResolves();

        return mailController.sendMail(mockParams).then((data) => {
          mockTransport.sendMail.args.length.should.equal(sendMailArgs.length);

          for (let i = 0; i < mockTransport.sendMail.args.length; i++) {
            mockTransport.sendMail.args[i].length.should.equal(2);
            // should be called with the message params
            mockTransport.sendMail.args[i][0].should.deep.equal(sendMailArgs[i]);
            // and a callback
            mockTransport.sendMail.args[i][1].constructor.name.should.equal('Function');
          }
        });
      });

      it('should reject if sendMail rejects', () => {
        const sendMailError = new Error('I hope this ruins your day');
        mockTransport.sendMail.callsArgWith(1, sendMailError, null);

        return mailController.sendMail(mockParams).then((data) => {
          // this should not happen
          throw new Error('This should have rejected');
        }).catch((error) => {
          error.should.equal(sendMailError);
        });
      });
    });

    /**
     * test a transport that is not implemented
     * could happen if application is deployed with bad config
     */
    describe('Unknown transport', () => {
      const transportName = 'morse code';

      beforeEach(() => {
        // set config to use unknown transport
        configStub.email.provider = transportName;

        mailController = proxyquire(uutPath, {
          '../../../../config/config': configStub
        })(mockLogger);
      });

      afterEach(() => {

      });

      it('should reject', () => {
        const unknownTransportError = new Error('Unknown email provider: ' + transportName);
        
        return mailController.sendMail(mockParams).then((data) => {
          throw new Error('This should have rejected');
        }).catch((error) => {
          error.should.deep.equal(unknownTransportError);
        });
      });
    });
  });
});
