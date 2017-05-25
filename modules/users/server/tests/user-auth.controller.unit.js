/* Testbench */
var chai = require('chai');
var should = chai.should();
chai.config.includeStack = true;

var sinon = require('sinon');
require('sinon-mongoose');

const MockSharedModule = require('./testbench/mock.shared.module');
var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
var ObjectID = require('mongodb').ObjectID;

var Keys = require('./../../../auth/server/models/Keys');
var User = require('./../models/Users');
var Users = mongoose.model('User');

const proxyquire = require('proxyquire');
const mockConfig = {
  app: {
    port_http: 80,
    host: 'blahblah.com',
    emailVerificationTTL: 100000,
    requireEmailVerification: true
  },
  email: {
    from: 'don\'t care'
  }
};

/* UUT */
var UserController = proxyquire('./../controllers/user-auth.controller', {
  '../../../../config/config': mockConfig
});

describe('UserAuthController', () => {
  var userController;
  var req, res, next;
  var mockLogger;
  var mockSharedModule;
  var saveStub;
  var statusStub;
  var sendStub;
  let mockUser;
  let sendMailStub;
    
  const token = 'abc123';
  
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

  const sendMailInfo = {
    envelope: {
      from: 'don\'t care',
      to: mockUserData.email
    },
    messageId: 'messageId'
  };

  const sendMailError = new Error('send mail failed');
  
  const verifyMailParams = {
    to: 'test@example.com',
    from: 'don\'t care',
    subject: 'Verification Email',
    text: 'Verify your email by going here: http://' + mockConfig.app.host + ':' + mockConfig.app.port_http + '/verifyEmail;token=' + token
  };

  const passwordMailParams = {
    to: 'test@example.com',
    from: 'don\'t care',
    subject: 'Change Password',
    text: 'Change your password by going here: http://' + mockConfig.app.host + ':' + mockConfig.app.port_http + '/changePassword;token=' + token
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
    
    generateUniqueTokenStub = sinon.stub(mockSharedModule.authHelpers, 'generateUniqueToken');
    generateUniqueTokenStub.returns(token);
  });

  afterEach(() => {
    // statusStub and sendStub are anonymous stubs so the do not have to be
    // restored
    saveStub.restore();
    generateUniqueTokenStub.restore();
  });

  describe('#register', () => {
    var validReqBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: '1234abcABC-'
    };

    beforeEach(() => {
      hashPasswordStub = sinon.stub(mockSharedModule.authHelpers, 'hashPassword');
      sendMailStub = sinon.stub(mockSharedModule.mail, 'sendMail');

      hashPasswordStub.resolves('hash');
      
      req.body = JSON.parse(JSON.stringify(validReqBody));
    });

    afterEach(() => {
      hashPasswordStub.restore();
      sendMailStub.restore();
    });

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    function setupSendMailResolves() {
      sendMailStub.resolves(sendMailInfo);
    }

    function setupAllResolve() {
      setupSaveResolves();
      setupSendMailResolves();
    }
    
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
      setupAllResolve();

      return userController.register(req, res, next).then((data) => {
        hashPasswordStub.args.should.deep.equal([[ req.body.password ]]);
      });
    });

    it('should use authHelpers.generateUniqueToken', () => {
      setupAllResolve();

      return userController.register(req, res, next).then((data) => {
        generateUniqueTokenStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should try to save the user', () => {
      setupAllResolve();

      return userController.register(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should send back the saved user', () => {
      setupAllResolve();

      return userController.register(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 201 ]]);
        sendStub.args.should.deep.equal([[ { user: mockUser } ]]);
      });
    });

    it('should handle 11000 duplicate index', () => {
      saveStub.rejects({
        name: 'MongoError',
        toJSON: () => { return {}; },
        code: 11000,
        errmsg: 'Duplicate'
      });

      return userController.register(req, res, next).then((data) => {
        statusStub.calledWith(500).should.equal(true);
        // response should be generic
        sendStub.calledWith('Internal Server Error');
      });
    });

    it('should handle invalid password as an error', () => {
      req.body.password = 'bad';

      return userController.register(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
      });
    });

    it('should send a 500 if save fails', () => {
      saveStub.rejects(new Error('saveFailed'));

      return userController.register(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should use shared.sendMail to send the verification email', () => {
      setupAllResolve();

      return userController.register(req, res, next).then((data) => {
        sendMailStub.args.should.deep.equal([[ verifyMailParams ]]);
      });
    });

    it('should send a 201 with additional message if the email sending fails', () => {
      setupSaveResolves();
      sendMailStub.rejects(sendMailError);

      return userController.register(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 201 ]]);
        sendStub.args.should.deep.equal([[ { user: mockUser, message: 'Verification email not sent' }]]);
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

    function setupAllResolve() {
      setupSaveResolves();
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.verifyEmail(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use user.save', () => {
      setupAllResolve();

      return userController.verifyEmail(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should set the user as verified and remove the ttl', () => {
      setupAllResolve();

      mockUser.verified.should.equal(false);
      
      return userController.verifyEmail(req, res, next).then((data) => {
        mockUser.verified.should.equal(true);
        should.not.exist(mockUser.verification.expires);
      });
    });

    it('should send a 204 on success', () => {
      setupAllResolve();

      return userController.verifyEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 if the user and token don\'t match', () => {
      req.query.token = 'xyz';

      return userController.verifyEmail(req, res, next).then((data) => {
        saveStub.called.should.equal(false);
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
        saveStub.called.should.equal(false);
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { message: 'Token has expired' } ]]);
      });
    });
  });

  describe('#requestVerificationEmail', () => {
    beforeEach(() => {
      sendMailStub = sinon.stub(mockSharedModule.mail, 'sendMail');

      req.user = mockUser;
      req.user.save = saveStub;
    });

    afterEach(() => {
    });

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    function setupSendMailResolves() {
      sendMailStub.resolves(sendMailInfo);
    }

    function setupAllResolve() {
      setupSaveResolves();
      setupSendMailResolves();
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.requestVerificationEmail(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should use user.save', () => {
      setupAllResolve();

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should set up a new token and ttl', () => {
      let oldTTL, newTTL, oldToken, newToken;
      oldToken = 'old';
      oldTTL = Date.now() - 10000;

      mockUser.verification.token = oldToken;
      mockUser.verification.expires = oldTTL;

      setupAllResolve();

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        newToken = mockUser.verification.token;
        newTTL = mockUser.verification.expires;

        should.exist(newToken);
        newToken.should.not.equal(oldToken);

        should.exist(oldToken);
        newTTL.should.be.above(oldTTL);
      });
    });

    it('should send a 204 on success', () => {
      setupAllResolve();

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if the save fails', () => {
      saveStub.rejects(new Error('Save failed'));

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
    
    it('should use authHelpers.generateUniqueToken', () => {
      setupAllResolve();

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        generateUniqueTokenStub.args.should.deep.equal([[ ]]);
      });
    });
    
    it('should use shared.sendMail to send the verification email', () => {
      setupAllResolve();

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        sendMailStub.args.should.deep.equal([[ verifyMailParams ]]);
      });
    });

    it('should send a 500 if sendmail fails', () => {
      setupSaveResolves();
      sendMailStub.rejects(sendMailError);

      return userController.requestVerificationEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });
  
  describe('#requestChangePasswordEmail', () => {
    let findMock;

    beforeEach(() => {
      sendMailStub = sinon.stub(mockSharedModule.mail, 'sendMail');
      usersMock = sinon.mock(Users);

      req.query = {
        email: mockUser.email
      };

      mockUser.verified = true;

      req.user = mockUser;
      req.user.save = saveStub;
    });

    afterEach(() => {
      usersMock.restore();
    });

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    function setupSendMailResolves() {
      sendMailStub.resolves(sendMailInfo);
    }

    function setupFindResolves() {
      usersMock.expects('find')
        .chain('exec')
        .resolves([ mockUser ]);
    }

    function setupAllResolve() {
      setupSaveResolves();
      setupSendMailResolves();
      setupFindResolves();
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.requestChangePasswordEmail(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should use user.save', () => {
      setupAllResolve();

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should set up a new token and ttl', () => {
      let oldTTL, newTTL, oldToken, newToken;
      oldToken = 'old';
      oldTTL = Date.now() - 10000;

      mockUser.resetPassword = {
        token: oldToken,
        expires: oldTTL
      };

      setupAllResolve();

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        newToken = mockUser.resetPassword.token;
        newTTL = mockUser.resetPassword.expires;

        should.exist(newToken);
        newToken.should.not.equal(oldToken);

        should.exist(oldToken);
        newTTL.should.be.above(oldTTL);
      });
    });

    it('should send a 204 on success', () => {
      setupAllResolve();

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if the save fails', () => {
      setupFindResolves();
      saveStub.rejects(new Error('Save failed'));

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
    
    it('should use authHelpers.generateUniqueToken', () => {
      setupAllResolve();

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        generateUniqueTokenStub.args.should.deep.equal([[ ]]);
      });
    });
    
    it('should use shared.sendMail to send the password reset email', () => {
      setupAllResolve();

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        sendMailStub.args.should.deep.equal([[ passwordMailParams ]]);
      });
    });

    it('should send a 500 if sendmail fails', () => {
      setupSaveResolves();
      setupFindResolves();
      sendMailStub.rejects(sendMailError);

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 if email is missing', () => {
      req.query = {};

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Missing email' } ]]);
      });
    });

    it('should use Users.find', () => {
      setupSaveResolves();
      setupSendMailResolves();
      usersMock.expects('find')
        .withExactArgs({ email: req.query.email })
        .chain('exec')
        .resolves([ mockUser ]);

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should send 204 if the user is not found', () => {
      // we dont want someone to be able to enumerate emails
      usersMock.expects('find')
        .chain('exec')
        .resolves([]);

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Email not found' } ]]);
      });
    });

    it('should send a 500 if the find fails', () => {
      usersMock.expects('find')
        .chain('exec')
        .rejects(new Error('Not found'));

      return userController.requestChangePasswordEmail(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });
  
  describe('#resetPassword', () => {
    const newPassword = 'abcABC123-';
    const weakPassword = 'abc';
    const hash = 'hash';

    beforeEach(() => {
      req.user = mockUser;
      req.body = {
        password: newPassword,
        token: token
      };
      
      mockUser.save = saveStub;

      mockUser.resetPassword = {
        token: token,
        expires: Date.now() + 500
      };

      hashPasswordStub = sinon.stub(mockSharedModule.authHelpers, 'hashPassword');
      usersMock = sinon.mock(Users);
    });

    afterEach(() => {
      hashPasswordStub.restore();
      usersMock.restore();
    });

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    function setupFindResolves() {
      usersMock.expects('find')
        .chain('exec')
        .resolves([ mockUser ]);
    }

    function setupHashResolves() {
      hashPasswordStub.resolves(hash);
    }

    function setupAllResolve() {
      setupSaveResolves();
      setupFindResolves();
      setupHashResolves();
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.resetPassword(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use user.save', () => {
      setupAllResolve();

      return userController.resetPassword(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should use users.find', () => {
      setupSaveResolves();
      setupHashResolves();
      usersMock.expects('find')
        .withExactArgs({ 'resetPassword.token': token })
        .chain('exec')
        .resolves([ mockUser ]);

      return userController.resetPassword(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should use authHelpers.hashPassword', () => {
      setupAllResolve();

      return userController.resetPassword(req, res, next).then((data) => {
        hashPasswordStub.args.should.deep.equal([[ newPassword ]]);
      });
    });

    it('should remove the token and ttl and set the new password on success', () => {
      setupAllResolve();
      
      return userController.resetPassword(req, res, next).then((data) => {
        mockUser.password.should.equal(hash);
        mockUser.resetPassword.should.deep.equal({});
      });
    });

    it('should send a 204 on success', () => {
      setupAllResolve();

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 if password is missing', () => {
      req.body.password = undefined;

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Missing password' } ]]);
      });
    });

    it('should send a 400 if token is missing', () => {
      req.body.token = undefined;

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Missing token' } ]]);
      });
    });

    it('should send a 400 if a user with the token is not found', () => {
      usersMock.expects('find').chain('exec').resolves([]);

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Token invalid' } ]]);
      });
    })

    it('should send a 400 if the password is too weak', () => {
      req.body.password = weakPassword;

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Password invalid' } ]]);
      });
    });

    it('should send a 400 if the ttl has passed', () => {
      setupAllResolve();
      mockUser.resetPassword = {
        token: token,
        expires: Date.now() - 100000
      };

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Token has expired' } ]]);
      });
    });

    it('should send a 500 if find fails', () => {
      usersMock.expects('find').chain('exec').rejects(new Error('Find failed'));

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if save fails', () => {
      setupFindResolves();
      saveStub.rejects(new Error('Save failed'));
      
      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if hashPassword fails', () => {
      setupFindResolves();
      setupSaveResolves();
      hashPasswordStub.rejects(new Error('HashPassword failed'));

      return userController.resetPassword(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });
});
