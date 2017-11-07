/* Testbench */
var chai = require('chai');
var should = chai.should();
chai.config.includeStack = true;

var sinon = require('sinon');
require('sinon-mongoose');

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

var ObjectID = require('mongodb').ObjectID;

var User = require('./../models/Users');
var Users = mongoose.model('User');

const proxyquire = require('proxyquire');

const mockConfig = {
  uploads: {
    profilePicture: {
      use: 'local',
      local: {
        dest: 'dest',
        limits: {
          fileSize: 1024 * 1024
        }
      },
      s3: {
        dest: 's3://url/bucket',
        bucket: 'bucket',
        acl: 'public-read',
        limits: {
          fileSize: 1024 * 1024
        }
      }
    }
  }
};

const path = require('path');

const MockSharedModule = require('./testbench/mock.shared.module');

/* UUT */
var UserController = proxyquire('./../controllers/user-profile.controller', {
  '../../../../config/config': mockConfig
});
    
describe('UserProfileController', () => {
  var userController;
  var req, res, next;
  var mockLogger;
  var generateSaltStub;
  var hashStub;
  var saveStub;
  var statusStub;
  var sendStub;
  let sendFileStub;
  let mockSharedModule;
    
  const mockUser = {
    _id: new ObjectID('012345678901234567890123'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hash',
    role: 'user',
    subroles: ['user'],
    verification: {
      token: 'blahblah',
      expires: Date.now()
    },
    resetPassword: {
      token: 'blahblah',
      expires: Date.now()
    }
  };

  const mockAdmin = {
    _id: new ObjectID('123451234512345123451234'),
    username: 'admin',
    email: 'admin@example.com',
    password: 'hash',
    role: 'admin',
    subroles: [ 'admin', 'user' ]
  };

  before(() => {
    mockLogger = {
      debug: () => {},
      info: (args) => {
      },
      warn: () => {},
      error: (args) => {
      },
      crit: () => {}
    };
  });

  /* Mock only the essentials for now
   * if a particular test needs more they can add it to the mocks.
   */
  beforeEach(() => {
    req = {
    };

    res = {
    };

    statusStub = sinon.stub();
    sendStub = sinon.stub();
    sendFileStub = sinon.stub();
    
    statusStub.returnsThis();

    res.status = statusStub;
    res.send = sendStub;
    res.sendFile = sendFileStub;

    next = () => {
    };

    usersMock = sinon.mock(Users);
    
    mockSharedModule = new MockSharedModule(mockLogger);
    userController = new UserController(mockLogger, mockSharedModule);
      
    req.user = mockUser;
    saveStub = sinon.stub(Users.prototype, 'save');
    mockUser.save = saveStub;
  });

  afterEach(() => {
    // statusStub and sendStub are anonymous stubs so the do not have to be
    // restored
    usersMock.restore();
    saveStub.restore();
  });

  describe('#changeProfilePicture', () => {
    const newUrl = 'newurl';

    let uploadStub;

    beforeEach(() => {
      uploadStub = sinon.stub(mockSharedModule.uploader, 'upload');
    });

    afterEach(() => {
      uploadStub.restore();
    });

    function setupAllResolve () {
      setupFindByIdResolves();
      setupUploadResolves();
      setupSaveResolves();
    }

    function setupFindByIdResolves () {
      usersMock.expects('findById')
        .withExactArgs(mockUser._id)
        .chain('exec')
        .resolves(mockUser);
    }

    function setupUploadResolves () {
      uploadStub.resolves(newUrl);
    }

    function setupSaveResolves () {
      saveStub.resolves(mockUser);
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.changeProfilePicture(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should use findById', async () => {
      setupAllResolve();

      await userController.changeProfilePicture(req, res, next);

      usersMock.verify();
    });

    it('should use upload with local config if strategy is local', async () => {
      mockConfig.uploads.profilePicture.use = 'local';

      setupAllResolve();

      await userController.changeProfilePicture(req, res, next);

      uploadStub.args.should.deep.equal([[ {
        strategy: 'local',
        oldFileUrl: mockUser.profileImageURL,
        req: req,
        res: res,
        local: {
          apiPrefix: '/api/users/' + mockUser._id + '/picture/',
          dest: 'dest',
          limits: {
            fileSize: 1024 * 1024
          }
        }
      } ]]);
    });

    it('should use upload with s3 config if strategy is s3', async () => {
      mockConfig.uploads.profilePicture.use = 's3';

      setupAllResolve();

      await userController.changeProfilePicture(req, res, next);

      uploadStub.args.should.deep.equal([[ {
        strategy: 's3',
        oldFileUrl: mockUser.profileImageURL,
        req: req,
        res: res,
        s3: {
          dest: 's3://url/bucket',
          bucket: 'bucket',
          acl: 'public-read',
          limits: {
            fileSize: 1024 * 1024
          }
        }
      } ]]);

      mockConfig.uploads.profilePicture.use = 'local';
    });

    it('should use save', async () => {
      setupAllResolve();

      await userController.changeProfilePicture(req, res, next);

      saveStub.called.should.equal(true);
    });

    it('should send 500 if the strategy is unknown', async () => {
      mockConfig.uploads.profilePicture.use = 'unknown';

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 500 ]]);
      sendStub.called.should.equal(true);

      mockConfig.uploads.profilePicture.use = 'local';
    });

    it('should send 500 if the findById fails', async () => {
      const findByIdError = new Error('findById failed');

      usersMock.expects('findById').chain('exec').rejects(findByIdError);

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 500 ]]);
      sendStub.called.should.equal(true);
    });

    it('should send 404 if user isnt found', async () => {
      usersMock.expects('findById').chain('exec').resolves(null);

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 404 ]]);
      sendStub.called.should.equal(true);
    });

    it('should send 500 if the upload fails', async () => {
      const uploadError = new Error('upload failed');

      setupFindByIdResolves();
      uploadStub.rejects(uploadError);

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 500 ]]);
      sendStub.called.should.equal(true);
    });

    it('should send a 500 if the save fails', async () => {
      const saveFailed = new Error('save failed');

      setupAllResolve();
      saveStub.reset();

      saveStub.rejects(saveFailed);

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 500 ]]);
      sendStub.called.should.equal(true);
    });

    it('should send a 400 if the save fails with a validation error', async () => {
      const saveValidationFailed = {
        name: 'ValidationError',
        message: 'index: blah invalid or whatever',
        errors: {
          blah: new Error('blah is invalid')
        }
      };

      setupAllResolve();
      saveStub.reset();

      saveStub.rejects(saveValidationFailed);

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 400 ]]);
      sendStub.args.should.deep.equal([[ saveValidationFailed.message ]]);
    });

    it('should send a 200 on success', async () => {
      setupAllResolve();

      await userController.changeProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 200 ]]);
      sendStub.args.should.deep.equal([[ mockUser ]]);
    });
  });

  describe('#getProfilePicture', () => {
    const userId = mockUser._id;
    const fileName = 'filename';

    beforeEach(() => {
      req.params = {
        userId: userId,
        fileName: fileName
      };
    });

    it('should return a promise', () => {
      usersMock.expects('findOne').resolves(mockUser);
      userController.getProfilePicture(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should use Users.findOne', async () => {
      usersMock.expects('findOne')
        .withExactArgs({ _id: mockUser._id })
        .resolves(mockUser);
      
      await userController.getProfilePicture(req, res, next);

      usersMock.verify();
    });

    it('should send a 200 and send the file', async () => {
      usersMock.expects('findOne').resolves(mockUser);

      await userController.getProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 200 ]]);
      sendFileStub.args.should.deep.equal([[ path.resolve('uploads/users/img/profilePicture/', req.params.fileName) ]]);
    });

    it('should send a 500 if the find one fails', async () => {
      usersMock.expects('findOne').rejects(new Error('failed'));

      await userController.getProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 500 ]]);
      sendStub.args.should.deep.equal([[ 'Error retrieving user information' ]]);
    });

    it('should send a 400 if local strategy isnt being used', async () => {
      mockConfig.uploads.profilePicture.use = 's3';
      usersMock.expects('findOne').resolves(mockUser);

      await userController.getProfilePicture(req, res, next);

      statusStub.args.should.deep.equal([[ 400 ]]);
      sendStub.args.should.deep.equal([[ 'Local strategy not in use' ]]);

      mockConfig.uploads.profilePicture.use = 'local';
    });
  });
});
