/* Testbench */
const q = require('q');
const chai = require('chai');
const should = chai.should();
chai.config.includeStack = true;

const sinon = require('sinon');

const uuid = require('uuid');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const proxyquire = require('proxyquire');

let mockLogger = require('./testbench/mock-logger');

/* UUT */
let UploaderController = require('./../controllers/uploader.controller');

describe('UploaderController', () => {
  let uploaderController;
  let req, res;
  let mockConfig;
  let multerMock;
  let multerStub;
  let singleSpy;
  let s3Stub;

  beforeEach(() => {
    req = {};
    res = {};

    mockConfig = {
      req: req,
      res: res,
    };

    multerStub = sinon.stub();
    multerMock = sinon.mock(multer);
    singleSpy = sinon.spy();
    s3Stub = sinon.stub(aws, 'S3');

    uploaderController = proxyquire('../controllers/uploader.controller', {
      multer: multerStub
    })(mockLogger);
  });

  afterEach(() => {
    //multerStub.restore();
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
        .constructor.name.should.equal('Promise');
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
      mockConfig.strategy = 'local';

      return uploaderController.upload(mockConfig).then((data) => {
        v1Stub.called.should.equal(true);
      });
    });

    it('should not use a uuid if config.newFileName is set', () => {
      mockConfig.strategy = 'local';
      mockConfig.newFileName = 'newfile';

      return uploaderController.upload(mockConfig).then((data) => {
        v1Stub.called.should.equal(false);
      });
    });
  });

  describe('uploadLocal', () => {
    let localConfig;
    let uploadStub;
    let diskStorageStub;
    
    beforeEach(() => {
      uploadStub = sinon.stub();
      diskStorageStub = sinon.stub(multer, 'diskStorage');

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
      diskStorageStub.restore();
    });

    function setupAllResolve() {
      multerStub.returns(multerMock);
      multerMock.expects('single')
        .returns(uploadStub);
      uploadStub.callsArgWith(2, null);
      diskStorageStub.returns('disk storage');
    }

    it('should return a promise', () => {
      setupAllResolve();

      uploaderController.uploadLocal(mockConfig)
        .constructor.name.should.equal('Promise');
    });

    it('should use the multer contructor and single method', () => {
      setupAllResolve();

      return uploaderController.uploadLocal(mockConfig).then(() => {
        let arg;
        multerStub.called.should.equal(true);
        arg.storage.should.equal('disk storage');

        multerMock.verify(); 
      });
    });

    it('should use the multer.diskStorage method', () => {
      setupAllResolve();

      return uploaderController.uploadLocal(mockConfig).then(() => {
        let arg;

        diskStorageStub.args.length.should.equal(1);
        diskStorageStub.args[0].length.should.equal(1);
        arg = diskStorageStub[0][0];

        arg.destination.constructor.name.should.equal('Function');
        arg.filename.constructor.name.should.equal('Function');
      });
    });

    it('should pass the fileFilter and limits', () => {
      setupAllResolve();
      return uploaderController.uploadLocal(mockConfig).then(() => {
        let arg;

        multerStub.args.length.should.equal(1);
        multerStub.args[0].length.should.equal(1);
        arg = multerStub.args[0][0];

        arg.fileFilter.should.equal(mockConfig.fileFilter);
        arg.limits.should.equal(mockConfig.local.limits);
      });
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
