/* Testbench */
const q = require('q');
const chai = require('chai');
const should = chai.should();
chai.config.includeStack = true;

const sinon = require('sinon');
require('sinon-as-promised');

const uuid = require('uuid');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

let mockLogger = require('./testbench/mock-logger');

/* UUT */
let UploaderController = require('./../controllers/uploader.controller');

describe('UploaderController', () => {
  let uploaderController;
  let req, res;
  let mockConfig;
  let multerMock;
  let singleSpy;
  let s3Stub;

  beforeEach(() => {
    req = {};
    res = {};

    mockConfig = {
      req: req,
      res: res,
    };

    multerMock = sinon.mock(multer);
    singleSpy = sinon.spy();
    s3Stub = sinon.stub(aws, 'S3');

    uploaderController = new UploaderController(mockLogger);
  });

  afterEach(() => {
    multerMock.restore();
    s3Stub.restore();
  });

  describe('upload', () => {
    let uploadLocalStub;
    let uploadS3Stub;
    let v1Stub;

    beforeEach(() => {
      uploadLocalStub = sinon.stub(uploaderController, 'uploadLocal')
        .resolves('url');
      uploadS3Stub = sinon.stub(uploaderController, 'uploadS3')
        .resolves('url');
      v1Stub = sinon.stub(uuid, 'v1').returns('uuid');
    });

    afterEach(() => {
      uploadLocalStub.restore();
      uploadS3Stub.restore();
      v1Stub.restore();
    });

    it('should return a promise', () => {
      uploaderController.upload(mockConfig)
        .constructor.should.equal('Promise');
    });

    it('should call s3 if config.strategy is "s3"', () => {
      mockConfig.strategy = 's3';

      return uploaderController.upload(mockConfig).then((data) => {
        uploadLocalStub.called.should.equal(false);
        uploadS3Stub.called.should.equal(true);
      });
    });

    it('should call local if config.strategy is "local"', () => {
      mockConfig.strategy = 'local';

      return uploaderController.upload(mockConfig).then((data) => {
        uploadLocalStub.called.should.equal(true);
        uploadS3Stub.called.should.equal(false);
      });
    });

    it('should use v1 uuids if config.newFileName is not set', () => {
      return uploaderController.upload(mockConfig).then((data) => {
        v1Stub.called.should.equal(true);
      });
    });

    it('should not use a uuid if config.newFileName is set', () => {
      mockConfig.newFileName = 'newfile';

      return uploaderController.upload(mockConfig).then((data) => {
        v1Stub.called.should.equal(false);
      });
    });
  });

  describe('uploadLocal', () => {
    let localConfig;
    
    beforeEach(() => {
      localConfig = {
        dest: './somewhere/',
        limits: {
          fileSize: 1024
        }
      };

      mockConfig.strategy = 'local';
      mockConfig.local = localConfig;
    });

    afterEach(() => {

    });

    it('should return a promise', () => {
      uploaderController.uploadLocal(mockConfig)
        .constructor.name.should.equal('Promise');
    });

    it('should use the multer contructor and single method', () => {
      multerMock.expects('single')
        .withExactArgs('file');
    });

    it('should use the multer.diskStorage method', () => {

    });

    it('should pass the fileFilter and limits', () => {

    });

    it('should use the fs.unlink method if config.oldFileName exists', () => {

    });
    
    it('should not use the fs.unlink method if config.oldFileName doesnt exists', () => {

    });

    it('should resolve with the url if successful', () => {

    });

    it('should reject if the upload fails', () => {

    });

    it('should reject if the unlink fails', () => {

    });
  });

  describe('uploadS3', () => {
    let s3Config;
    
    beforeEach(() => {
      s3Config = {
        bucket: 'bucketname',
        acl: 'public',
        limits: {
          fileSize: 1024
        }
      };

      mockConfig.strategy = 's3';
      mockConfig.s3 = s3Config;
    });

    afterEach(() => {

    });

    it('should return a promise', () => {
      uploaderController.uploadLocal(mockConfig)
        .constructor.name.should.equal('Promise');
    });

    it('should use the multer contructor and single method', () => {

    });

    it('should use the multer.multerS3 method', () => {

    });

    it('should pass the fileFilter and limits', () => {

    });

    it('should use the s3.deleteObject method if config.oldFileName exists', () => {

    });
    
    it('should not use the s3.deleteObject method if config.oldFileName doesnt exists', () => {

    });

    it('should resolve with the url if successful', () => {

    });

    it('should reject if the upload fails', () => {

    });

    it('should reject if the deleteObject fails', () => {

    });
  });
});
