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
      use: 'local'
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
    it('should return a promise', () => {

    });

    it('shoud send a 403 if the user is not authorized', async () => {

    });

    it('should use findById', async () => {

    });

    it('should use upload', async () => {

    });

    it('should use save', async () => {

    });

    it('should send 500 if the strategy is unknown', async () => {

    });

    it('should send 500 if the findById fails', async () => {

    });

    it('should send 404 if user isnt found', async () => {

    });

    it('should send 500 if the upload fails', async () => {

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
