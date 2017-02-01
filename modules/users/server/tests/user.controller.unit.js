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
var UserController = require('./../controllers/user.controller');
    
describe('UserController', () => {
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
  
  describe('#Read', () => {
    var findOneStub;

    beforeEach(() => {
      findOneStub = sinon.stub(Users, 'findOne');
    });

    afterEach(() => {
      findOneStub.restore();
    });
    
    it('should return a promise', () => {
      req.params = { userId: mockUser._id };
      req.user = mockUser;

      userController.read(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should require an id in the url', () => {
      req.params = {};
      req.user = mockUser;
      
      userController.read(req, res, next);
          statusStub.args.should.deep.equal([ [ 400 ] ]);
          sendStub.args.should.deep.equal([ ['Malformed request' ] ]);
    });

    it('should send an error if it fails to retrive the user', () => {
      const id = '98765432109876543210';
      req.params = { userId: id };
      req.user = mockUser;

      //TODO what does this error look like?
      findOneStub.returns(Promise.reject('Oh gosh an error'));
      
      statusStub.called.should.equal(true);
      statusStub.args.should.deep.equal([ [ 500 ] ]);

      sendStub.called.should.equal(true);
      sendStub.args.should.deep.equal([ [ 'Error retrieving user information' ] ]);
    });

    it('should allow users to get their own User objects', () => {
      const id = mockUser._id;
      req.params = { userId: id };
      req.user = mockUser;

      findOneStub.returns(Promise.resolve(mockUser));

      userController.read(req, res, next);

      statusStub.called.should.equal(true);
      sendStub.called.should.equal(true);
      statusStub.args.should.deep.equal([ [ 200 ] ]);
      sendStub.args.should.deep.equal([ [ mockUser ] ]);
    });

    it('should allow admin user to get User objects', () => {
      const id = mockUser._id;
      req.params = { userId: id };
      req.user = mockAdmin;

      findOneStub.returns(Promise.resolve(mockUser));

      userController.read(req, res, next);

      statusStub.called.should.equal(true);
      statusStub.args.should.deep.equal([ [ 200 ] ]);

      sendStub.called.should.equal(true);
      sendStub.args.should.deep.equal([ [ mockUser ] ]);
    });

    it('should not let users without admin role get other Users', () => {
      const id = mockAdmin._id;
      req.params = { userId: id };
      req.user = mockUser;

      userController.read(req, res, next);

      statusStub.called.should.equal(true);
      statusStub.args.should.deep.equal([ [ 401 ] ]);
      
      sendStub.called.should.equal(true);
      sendStub.args.should.deep.equal([ [ 'Unauthorized' ] ]);
    });
  });

  describe('#create', () => {
    var saveStub;

    beforeEach(() => {
      saveStub = sinon.stub(Users.prototype, 'save');
    });

    afterEach(() => {
      saveStub.restore();
    });

    it('should return a promise', () => {
      req.user = mockAdmin;
      req.body = {
        username: 'new',
        email: 'test@test.com',
        password: '1234abcABC-'
      };

      userController.create(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should not allow users without the right role to create a user', () => {
      req.user = mockUser
      req.body = {
        username: 'new',
        password: '1234abcABC-',
        email: 'new@test.com'
      };

      return userController.create(req, res, next)
        .then((data) => {
          saveStub.called.should.equal(false);
          statusStub.args.should.deep.equal([ [ 401 ] ]);
          sendStub.args.should.deep.equal([ [ 'Unauthorized' ] ]);
        });
    });

    it('should use the save method to make a new user', () => {
      req.user = mockAdmin;
      req.body = {
        username: 'new',
        password: '1234abcABC-',
        email: 'new@test.com'
      };

      saveStub.callsArgWith(0, null, req.body);

      return userController.create(req, res, next)
        .then((data) => {
          saveStub.called.should.equal(true);
          statusStub.args.should.deep.equal([ [ 201 ] ]);
          sendStub.args.should.deep.equal([ [ req.body ] ]);
        });
    });

    it('should send an error if the user cannot be saved', () => {
      req.user = mockAdmin;
      req.body = {
        username: 'new',
        password: '1234abcABC-',
        email: 'new@test.com'
      };

      saveStub.callsArgWith(0, 'ERROR', null);

      return userController.create(req, res, next)
        .then((data) => {
          saveStub.called.should.equal(true);
          statusStub.args.should.deep.equal([ [ 500 ] ]);
          sendStub.args.should.deep.equal([ [ 'Internal Server Error' ] ]);
        });
    });
  });

  describe('#delete', () => {
    var findOneStub;
    var mockQuery;
    var removeStub;

    beforeEach(() => {
      findOneStub = sinon.stub(Users, 'findOne');
      removeStub = sinon.stub();
      
      findOneStub.returns(removeStub);
      
      mockQuery.remove = removeStub;
    });

    afterEach(() => {
      findOneStub.restore();
    });

    it('should return a Promise', () => {
      req.user = mockAdmin;
      req.params = { userId: mockUser._id };

      userController.deleteUser(req, res, next)
        .constructor.name.should.equal('Promise');
    });

    it('should not allow users without the right role delete a user', () => {
      req.user = mockUser;
      // regular user is definately not allowed to delete admin
      req.params = { userId: mockAdmin._id };

      return userController.deleteUser(req, res, next)
        .then((data) => {
          
        });
    });

    it('should find the user then remove it', () => {
      req.user = mockAdmin;
      req.params = { userId: mockUser._id };

      //TODO what gets sent as data?
      return removeStub.callsArgWith(0, null, mockUser)
        .then((data) => {
          findOneStub.called.should.equal(true);
          removeStub.called.should.equal(true);

          statusStub.args.should.deep.equal([ [ 200 ] ]);
          sendStub.args.should.deep.equal([ [ 'User Deleted' ] ]);
        });
    });

    it('should handle find errors', () => {
      req.user = mockAdmin;
      req.params = { userId: mockUser._id };

      return 
    });

    it('should handle removal errors', () => {

    });
  });
});
