/* Testbench */
var chai = require('chai');
var should = chai.should();
chai.config.includeStack = true;

var sinon = require('sinon');
require('sinon-mongoose');
require('sinon-as-promised');

var argon2 = require('argon2');
var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
var ObjectID = require('mongodb').ObjectID;

var Keys = require('./../../../auth/server/models/Keys');
var User = require('./../models/Users');
var Users = mongoose.model('User');

const MockSharedModule = require('./testbench/mock.shared.module');

/* UUT */
var UserController = require('./../controllers/user-crud.controller');
    
describe('UserCrudController', () => {
  var userController;
  var req, res, next;
  var mockLogger;
  var generateSaltStub;
  var hashStub;
  var saveStub;
  var statusStub;
  var sendStub;
  let mockSharedModule;
    
  const mockUser = {
    _id: new ObjectID('012345678901234567890123'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hash',
    roles: ['user'],
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
    roles: [ 'admin', 'user' ]
  };

  before(() => {
    mockLogger = {
      debug: () => {},
      info: (args) => {
        console.log(args);
      },
      warn: () => {},
      error: (args) => {
        console.log(args);
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
    
    statusStub.returnsThis();

    res.status = statusStub;
    res.send = sendStub;

    next = () => {
    };

    mockSharedModule = new MockSharedModule(mockLogger);
    userController = new UserController(mockLogger, mockSharedModule);
      
    req.user = mockUser;
    mockUser.save = sinon.stub();
    saveStub = mockUser.save;
  });

  afterEach(() => {
    // statusStub and sendStub are anonymous stubs so the do not have to be
    // restored
  });

  describe('#read', () => {
    let usersMock;

    beforeEach(() => {
      usersMock = sinon.mock(Users);
      
      req.params = {
        userId: mockUser._id
      };
    });

    afterEach(() => {
      usersMock.restore();
    });

    function setupAllResolve() {
      setupFindOneResolves();
    }

    function setupFindOneResolves() {
      usersMock.expects('findOne')
        .chain('exec')
        .resolves(mockUser);
    }

    it('should return a promise', () => {
      userController.read(req, res, next).constructor.name.should.equal('Promise');
    });

    it('should use Users.findOne', () => {
      usersMock.expects('findOne')
        .withExactArgs({ _id: mockUser._id })
        .chain('exec')
        .resolves(mockUser);

      return userController.read(req, res, next).then((data) => {
        usersMock.verify().should.equal(true);
      });
    });

    it('should let a user read itself', () => {
      setupAllResolve();

      return userController.read(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
      });
    });

    it('should let an authorized user read it', () => {
      setupAllResolve();
      req.user = mockAdmin;

      return userController.read(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
      });
    });

    it('should send a 200 and the sanitized user on success', () => {
      setupAllResolve();

      return userController.read(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
        
        sendStub.args.length.should.equal(1);
        sendStub.args[0].length.should.equal(1);

        let sanitized = sendStub.args[0][0];
        should.not.exist(sanitized.password);
        should.not.exist(sanitized.verification.token);
        should.not.exist(sanitized.resetPassword.token);
      });
    });

    it('should send a 403 if not authorized', () => {
      usersMock.expects('findOne')
        .chain('exec')
        .resolves(mockAdmin);

      return userController.read(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 403 ]]);
      });
    });

    it('should send a 404 if not found', () => {
      usersMock.expects('findOne')
        .chain('exec')
        .resolves(null);

      return userController.read(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 404 ]]);
      });
    });

    it('should send a 500 if findOne fails', () => {
      usersMock.expects('findOne')
        .chain('exec')
        .rejects(new Error('findOne failed'));

      return userController.read(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
      });
    });
  });

  describe('#list', () => {
    let findStub;

    beforeEach(() => {

    });

    afterEach(() => {

    });

    it('should return a promise', () => {

    });

    it('should use Users.find sort and paginate', () => {

    });

    it('should sanitize users', () => {

    });

    it('should send a 200 and a list on success', () => {

    });

    it('should send a 500 if Users.find fails', () => {

    });
  });
});
