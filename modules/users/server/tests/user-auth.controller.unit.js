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

/* UUT */
var UserController = require('./../controllers/user-auth.controller');
    
describe('UserAuthController', () => {
  var userController;
  var req, res, next;
  var mockLogger;
  var generateSaltStub;
  var hashStub;
  var saveStub;
  var statusStub;
  var sendStub;
    
  const mockUser = {
    _id: new ObjectID('012345678901234567890123'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hash',
    roles: ['user']
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

    userController = new UserController(mockLogger);
  });

  afterEach(() => {
    // statusStub and sendStub are anonymous stubs so the do not have to be
    // restored
  });

  describe('#register', () => {
    var validReqBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: '1234abcABC-'
    };

    beforeEach(() => {
      // argon2 stubs
      generateSaltStub = sinon.stub(argon2, 'generateSalt');
      hashStub = sinon.stub(argon2, 'hash');

      generateSaltStub.returns(Promise.resolve('salt'));
      hashStub.returns(Promise.resolve('hash'));

      //mongoose stubs
      saveStub = sinon.stub(Users.prototype, 'save');
    });

    afterEach(() => {
      generateSaltStub.restore();
      hashStub.restore();

      saveStub.restore();
    });
    
    it('should return a promise', () => {
      req.body = {
        username: 'newuser',
        email: 'test@example.com',
        password: '1234abcABC-'
      };

      userController.register(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should use argon2 to salt and hash the password', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, null, { username: 'testuser' });

      return userController.register(req, res, next)
        .then((data) => {
          generateSaltStub.called.should.equal(true);
          hashStub.called.should.equal(true);
        });
    });

    it('should try to save the user', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, null, { username: 'testuser' });

      return userController.register(req, res, next)
        .then((data) => {
          saveStub.called.should.equal(true);
        });
    });

    it('should send back the saved user', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, null, { username: 'testuser' });

      return userController.register(req, res, next)
        .then((data) => {
          statusStub.calledWith(201).should.equal(true);
        });
    });

    it('should handle 11000 duplicate index', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, {
        name: 'MongoError',
        toJSON: () => { return {}; },
        code: 11000,
        errmsg: 'Duplicate'
      }, null);

      return userController.register(req, res, next)
        .then((data) => {
          statusStub.calledWith(500).should.equal(true);
          // response should be generic
          sendStub.calledWith('Internal Server Error');
        });
    });

    it('should handle invalid password as an error', () => {
      req.body = validReqBody;
      req.body.password = 'bad';

      return userController.register(req, res, next)
        .then((data) => {
          statusStub.calledWith(400).should.equal(true);
        });
    });
  });
});
