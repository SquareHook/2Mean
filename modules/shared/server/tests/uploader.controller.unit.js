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
const fs = require('fs');
const path = require('path');

let mockLogger = require('./testbench/mock-logger');

/* UUT */
let UploaderController = require('./../controllers/uploader.controller');

describe('UploaderController', () => {
  let uploaderController;
  let req, res;
  let mockConfig;
  let multerStub;
  let multerS3Stub;
  let config;

  beforeEach(() => {
    req = {};
    res = {};

    mockConfig = {
      req: req,
      res: res,
    };

    multerStub = sinon.stub();
    multerS3Stub = sinon.stub();

    uploaderController = proxyquire('../controllers/uploader.controller', {
      multer: multerStub,
      'multer-s3': multerS3Stub
    })(mockLogger);
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
      mockConfig.strategy = 'local';

      uploaderController.upload(mockConfig)
        .constructor.name.should.equal('Promise');
    });

    it('should reject if the strategy is not known', async () => {
      mockConfig.strategy = 'unknown';

      try {
        await uploaderController.upload(mockConfig);
      } catch (error) {
        error.message.should.equal('Configuration error: unknown upload strategy');
        return;
      }
      throw new Error('Should have thrown');
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

    it('should set an oldFilename if an oldFileUrl is set', () => {
      mockConfig.oldFileUrl = 'abc.xyz/blah.jpg';
      mockConfig.strategy = 'local';

      return uploaderController.upload(mockConfig).then((data) => {
        uploadLocalStub.args[0][0].oldFileName.should.equal('blah.jpg');
      });
    });
  });

  describe('uploadLocal', () => {
    const newUrl = 'api/newfile';

    let diskStorage,
      singleStub,
      uploadStub,
      unlinkStub;

    beforeEach(() => {
      diskStorageStub = sinon.stub();
      singleStub = sinon.stub();
      uploadStub = sinon.stub();
      unlinkStub = sinon.stub(fs, 'unlink');

      mockConfig = {
        local: {
          limits: {
            fileSize: 1024
          },
          dest: './somewhere/',
          apiPrefix: 'api/'
        },
        newFileName: 'newfile',
        fileFilter: 'fileFilter',
        strategy: 'local'
      };
    });

    afterEach(() => {
      unlinkStub.restore();
    });

    function setupAllResolve() {
      multerStub.returns({ single: singleStub });
      multerStub.diskStorage = diskStorageStub;
      diskStorageStub.returns('disk storage');
      singleStub.returns(uploadStub);
      uploadStub.callsArgWith(2, null);
      unlinkStub.callsArgWith(1, null);
    }

    it('should return a promise', () => {
      setupAllResolve();

      uploaderController.uploadLocal(mockConfig)
        .constructor.name.should.equal('Promise');
    });

    it('should use the multer contructor and single method', async () => {
      setupAllResolve();

      await uploaderController.uploadLocal(mockConfig);

      let arg = multerStub.args[0][0];

      arg.storage.should.equal('disk storage');
      arg.fileFilter.should.equal(mockConfig.fileFilter);
      arg.limits.should.deep.equal(mockConfig.local.limits);

      arg = diskStorageStub.args[0][0];

      // should call the cb with the dest
      arg.destination(undefined, undefined, (error, dest) => {
        should.not.exist(error);
        dest.should.equal(mockConfig.local.dest);
      });

      // should call the cb with the filename
      arg.filename(undefined, undefined, (error, filename) => {
        should.not.exist(error);
        filename.should.equal(mockConfig.newFileName);
      });

      singleStub.args.should.deep.equal([[ 'file' ]]);
    });

    it('should use the fs.unlink method if config.oldFileName exists', async () => {
      setupAllResolve();

      mockConfig.oldFileName = 'old file name';

      await uploaderController.uploadLocal(mockConfig);

      let args = unlinkStub.args[0];
      args[0].should.equal(path.resolve(mockConfig.local.dest, mockConfig.oldFileName));
      args[1].constructor.name.should.equal('Function');
    });
    
    it('should not use the fs.unlink method if config.oldFileName doesnt exists', async () => {
      setupAllResolve();

      await uploaderController.uploadLocal(mockConfig);

      unlinkStub.args.should.deep.equal([]);
    });

    it('should resolve with the url if successful', async () => {
      setupAllResolve();

      let result = await uploaderController.uploadLocal(mockConfig);

      result.should.equal(newUrl);
    });

    it('should reject if the upload fails', async () => {
      let uploadFailedError = new Error('upload failed');
      setupAllResolve();
      uploadStub.reset();
      uploadStub.callsArgWith(2, uploadFailedError);

      try {
        await uploaderController.uploadLocal(mockConfig);
      } catch (error) {
        error.should.deep.equal(uploadFailedError);
        return;
      }

      throw new Error('Should have thrown an error');
    });

    it('should not reject if the unlink fails', async () => {
      setupAllResolve();
      unlinkStub.reset();
      unlinkStub.callsArgWith(1, new Error('failed'));

      mockConfig.oldFileName = 'old file name';

      await uploaderController.uploadLocal(mockConfig);
    });
  });

  describe('uploadS3', () => {
    const newUrl = './somewhere/newfile';

    let s3Stub,
      singleStub,
      uploadStub,
      deleteObjectStub;

    beforeEach(() => {
      singleStub = sinon.stub();
      uploadStub = sinon.stub();
      s3Stub = sinon.stub(aws, 'S3');
      deleteObjectStub = sinon.stub(aws.S3.prototype, 'deleteObject');
      s3Stub.returns({
        deleteObject: deleteObjectStub
      });

      mockConfig = {
        s3: {
          bucket: 'bucket',
          acl: 'acl',
          limits: {
            fileSize: 1024
          },
          dest: './somewhere/'
        },
        newFileName: 'newfile',
        fileFilter: 'fileFilter',
        strategy: 's3'
      };
    });

    afterEach(() => {
      s3Stub.restore();
    });

    function setupAllResolve() {
      multerStub.returns({ single: singleStub });
      multerS3Stub.returns('multerS3');
      singleStub.returns(uploadStub);
      uploadStub.callsArgWith(2, null);
      deleteObjectStub.callsArgWith(1, null, null);
    }

    it('should return a promise', () => {
      setupAllResolve();

      uploaderController.uploadS3(mockConfig)
        .constructor.name.should.equal('Promise');
    });

    it('should use the multer contructor and single method', async () => {
      setupAllResolve();

      await uploaderController.uploadS3(mockConfig);

      let arg = multerStub.args[0][0];

      arg.storage.should.equal('multerS3');
      arg.fileFilter.should.equal(mockConfig.fileFilter);
      arg.limits.should.deep.equal(mockConfig.s3.limits);

      arg = multerS3Stub.args[0][0];

      arg.bucket.should.equal('bucket');
      arg.acl.should.equal('acl');

      // should call the cb with the metadata
      arg.metadata(undefined, { fieldname: 'fieldname' }, (error, meta) => {
        should.not.exist(error);
        meta.should.deep.equal({ fieldName: 'fieldname' });
      });

      // should call the cb with the filename
      arg.key(undefined, undefined, (error, filename) => {
        should.not.exist(error);
        filename.should.equal(mockConfig.newFileName);
      });

      singleStub.args.should.deep.equal([[ 'file' ]]);
    });

    it('should use the s3.deleteObject method if config.oldFileName exists', async () => {
      setupAllResolve();

      mockConfig.oldFileName = 'old file name';

      await uploaderController.uploadS3(mockConfig);

      deleteObjectStub.args[0][0].should.deep.equal({
        Bucket: 'bucket',
        Key: mockConfig.oldFileName
      });
    });
    
    it('should not use the s3.deleteObject method if config.oldFileName doesnt exists', async () => {
      setupAllResolve();

      await uploaderController.uploadS3(mockConfig);

      deleteObjectStub.args.should.deep.equal([]);
    });

    it('should resolve with the url if successful', async () => {
      setupAllResolve();

      let result = await uploaderController.uploadS3(mockConfig);

      result.should.equal(newUrl);
    });

    it('should reject if the upload fails', async () => {
      let uploadFailedError = new Error('upload failed');
      setupAllResolve();
      uploadStub.reset();
      uploadStub.callsArgWith(2, uploadFailedError);

      try {
        await uploaderController.uploadS3(mockConfig);
      } catch (error) {
        error.should.deep.equal(uploadFailedError);
        return;
      }

      throw new Error('Should have thrown an error');
    });

    it('should reject if the delete object fails', async () => {
      const deleteFailedError = new Error('deleteObjectFailed');
      setupAllResolve();
      deleteObjectStub.reset();
      deleteObjectStub.callsArgWith(1, deleteFailedError);

      mockConfig.oldFileName = 'old file name';

      try {
        await uploaderController.uploadS3(mockConfig);
      } catch (error) {
        error.should.deep.equal(deleteFailedError);
        return;
      }

      throw new Error('should have thrown');
    });
  });
});
