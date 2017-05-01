/* Testbench */
var chai = require('chai');
var should = chai.should();
chai.config.includeStack = true;

var sinon = require('sinon');
require('sinon-mongoose');
require('sinon-as-promised');

const MockSharedModule = require('./testbench/mock.shared.module');
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
  var mockSharedModule;
  var saveStub;
  var statusStub;
  var sendStub;
  let mockUser;
    
  const token ='abc';

  const mockUserData = {
    _id: new ObjectID('012345678901234567890123'),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hash',
    roles: ['user'],
    verified: false,
    verification: {
      token: token
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
    mockUser = JSON.parse(JSON.stringify(mockUserData));
    mockUser.verification.expires = Date.now() + 500;

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

    //mongoose stubs
    saveStub = sinon.stub(Users.prototype, 'save');
  });

  afterEach(() => {
    // statusStub and sendStub are anonymous stubs so the do not have to be
    // restored
    saveStub.restore();
  });

  describe('#register', () => {
    var validReqBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: '1234abcABC-'
    };

    beforeEach(() => {
      hashPasswordStub = sinon.stub(mockSharedModule.authHelpers, 'hashPassword');
      generateUniqueTokenStub = sinon.stub(mockSharedModule.authHelpers, 'generateUniqueToken');

      hashPasswordStub.resolves('hash');
    });

    afterEach(() => {
      hashPasswordStub.restore();
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

    it('should use authHelpers.hashPassword to hash the password', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, null, mockUser);

      return userController.register(req, res, next)
        .then((data) => {
          hashPasswordStub.args.should.deep.equal([[ req.body.password ]]);
        });
    });

    it('should use authHelpers.generateUniqueToken', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, null, mockUser);

      return userController.register(req, res, next).then((data) => {
        generateUniqueTokenStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should try to save the user', () => {
      req.body = validReqBody;
      saveStub.callsArgWith(0, null, mockUser);

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

  describe('#changePassword', () => {
    const oldPassword = '123';
    const newPassword = 'abcABC123-';
    const invalidPassword = '123';

    const validReqBody = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };

    const match = true;
    const hash = 'hash';

    let hashPasswordStub, verifyPasswordStub;

    beforeEach(() => {
      req.body = validReqBody;
      req.body.newPassword = newPassword;
      req.user = mockUser;
      req.user.save = saveStub;

      hashPasswordStub = sinon.stub(mockSharedModule.authHelpers, 'hashPassword');
      verifyPasswordStub = sinon.stub(mockSharedModule.authHelpers, 'verifyPassword');
    });

    afterEach(() => {
      hashPasswordStub.restore();
      verifyPasswordStub.restore();
    });

    function setupAllResolve() {
      setupVerifyResolves();
      setupHashResolves();
      setupSaveResolves();
    }

    function setupVerifyResolves() {
      verifyPasswordStub.resolves(match);
    }

    function setupHashResolves() {
      hashPasswordStub.resolves(hash);
    }

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.changePassword(req, res, next).constructor.name.should.equal('Promise');
    });

    it('should use authHelpers.verifyPassword', () => {
      setupAllResolve();

      return userController.changePassword(req, res, next).then((data) => {
        verifyPasswordStub.args.should.deep.equal([[ mockUser.password, oldPassword ]]);
      });
    });

    it('should use authHelpers.hashPassword', () => {
      setupAllResolve();

      return userController.changePassword(req, res, next).then((data) => {
        hashPasswordStub.args.should.deep.equal([[ newPassword ]]);
      });
    });

    it('should use user.save', () => {
      setupAllResolve();
      
      return userController.changePassword(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should 200 with updated user on success', () => {
      setupAllResolve();

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
        sendStub.args.should.deep.equal([[ mockUser ]]);
      });
    });

    it('should 400 on weak password', () => {
      setupVerifyResolves();
      req.body.newPassword = invalidPassword;

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        let args = sendStub.args;
        args.length.should.equal(1);
        args[0].length.should.equal(1);
        args[0][0].message.should.contain('Invalid password');
      });
    });

    it('should 400 on wrong old password', () => {
      verifyPasswordStub.resolves(false);

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { message: 'Incorrect Username/Password' } ]]);
      });
    });

    it('should 400 if save validator errors', () => {
      const validatorError = {
        name: 'ValidationError',
        message: 'Something is invalid',
        errors: [ { name: 'ValidatorError' } ]
      };

      setupVerifyResolves();
      setupHashResolves();
      saveStub.rejects(validatorError);

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { message: validatorError.message } ]]);
      });
    });

    it('should 500 if save fails', () => {
      const saveError = new Error('save error');

      setupVerifyResolves();
      setupHashResolves();
      saveStub.rejects(saveError);

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should 500 if verify fails', () => {
      const matchError = new Error('match error');

      verifyPasswordStub.rejects(matchError);

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should 500 if hash fails', () => {
      const hashError = new Error('hash error');

      setupVerifyResolves();
      hashPasswordStub.rejects(hashError);

      return userController.changePassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });

  describe('#verifyEmail', () => {
    beforeEach(() => {
      req.user = mockUser;
      req.query = {
        token: token
      };

      req.user.save = saveStub;
    });

    afterEach(() => {
    });

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    it('should return a promise', () => {
      setupSaveResolves();

      userController.verifyEmail(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use user.save', () => {
      setupSaveResolves();

      return userController.verifyEmail(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should set the user as verified and remove the ttl', () => {
      setupSaveResolves();

      mockUser.verified.should.equal(false);
      
      return userController.verifyEmail(req, res, next).then((data) => {
        mockUser.verified.should.equal(true);
        should.not.exist(mockUser.verification.expires);
      });
    });

    it('should send a 204 on success', () => {
      setupSaveResolves();

      return userController.verifyEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 if the user and token don\'t match', () => {
      req.query.token = 'xyz';

      return userController.verifyEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { message: 'Token invalid' } ]]);
      });
    });

    it('should send a 500 if the save fails', () => {
      saveStub.rejects(new Error('save failed'));

      return userController.verifyEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 if the ttl has passed', () => {
      // set expire time to some time in the past
      mockUser.verification.expires = Date.now() - 100000;

      return userController.verifyEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { message: 'Token has expired' } ]]);
      });
    });
  });
});
