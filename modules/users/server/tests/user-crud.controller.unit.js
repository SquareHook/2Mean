/* Testbench */
var chai = require('chai');
var should = chai.should();
chai.config.includeStack = true;

var sinon = require('sinon');
require('sinon-mongoose');

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
  const pageLimit = 25;
  
  var userController;
  var req, res, next;
  var mockLogger;
  var generateSaltStub;
  var hashStub;
  var saveStub;
  var statusStub;
  var sendStub;
  let mockSharedModule;
  let usersMock;
    
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
    
    statusStub.returnsThis();

    res.status = statusStub;
    res.send = sendStub;

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

  describe('#read', () => {
    beforeEach(() => {
      req.params = {
        userId: mockUser._id
      };
    });

    afterEach(() => {

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
        usersMock.verify();
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
    let usersList;

    beforeEach(() => {
      req.query = {};
      
      usersList = [
        JSON.parse(JSON.stringify(mockUser)),
        JSON.parse(JSON.stringify(mockUser)),
        JSON.parse(JSON.stringify(mockUser))
      ];
    });

    afterEach(() => {

    });

    function setupAllResolve() {
      setupFindResolves();
    }

    function setupFindResolves() {
      usersMock.expects('find')
        .chain('sort')
        .chain('skip')
        .chain('limit')
        .chain('exec')
        .resolves(usersList);
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.list(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use Users.find sort and paginate', () => {
      // page defaults to 1
      // search defaults to ''
      // no search
      const expectedQuery = {};
      const expectedSort = 'username';
      const expectedSkip = 0;
      const expectedLimit = pageLimit;

      usersMock.expects('find').withExactArgs(expectedQuery)
        .chain('sort').withExactArgs(expectedSort)
        .chain('skip').withExactArgs(expectedSkip)
        .chain('limit').withExactArgs(expectedLimit)
        .chain('exec')
        .resolves(usersList);
      
      return userController.list(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should use req.page to skip users', () => {
      req.query.page = 3

      const expectedSkip = 2 * pageLimit;

      usersMock.expects('find')
        .chain('sort')
        .chain('skip').withExactArgs(expectedSkip)
        .chain('limit')
        .chain('exec')
        .resolves(usersList);

      return userController.list(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should use a search query param if present', () => {
      req.query.search = 'someone'

      const expectedQuery = {
        username: /[a-z]*someone+?/i
      };

      usersMock.expects('find').withExactArgs(expectedQuery)
        .chain('sort')
        .chain('skip')
        .chain('limit')
        .chain('exec')
        .resolves(usersList);

      return userController.list(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should send a 200 and a list of sanitized users on success', () => {
      setupAllResolve();

      return userController.list(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
        sendStub.args.length.should.equal(1);
        sendStub.args[0].length.should.equal(1);
        sendStub.args[0][0].length.should.equal(usersList.length);

        sendStub.args[0][0].forEach((sentUser) => {
          should.not.exist(sentUser.password);
          should.not.exist(sentUser.verification.token);
          should.not.exist(sentUser.resetPassword.token);
        });
      });
    });

    it('should send a 500 if Users.find fails', () => {
      usersMock.expects('find')
        .chain('sort')
        .chain('skip')
        .chain('limit')
        .chain('exec')
        .rejects(new Error('Find failed'));

      return userController.list(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]])
      });
    });
  });

  describe('#create', () => {
    beforeEach(() => {
      req.user = mockAdmin;
      
      req.body = {
        username: 'new',
        email: 'new'
      };
    });

    function setupAllResolve() {
      setupSaveResolves();
    }

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.create(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should let an authorized user create', () => {
      setupAllResolve();

      return userController.create(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 201 ]]);
      });
    });

    it('should use user.save', () => {
      setupAllResolve();

      return userController.create(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should send a 201 and the sanitized user on success', () => {
      setupAllResolve();

      return userController.create(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 201 ]]);
        sendStub.args.length.should.equal(1);
        sendStub.args[0].length.should.equal(1);
        should.not.exist(sendStub.args[0][0].password);
        should.not.exist(sendStub.args[0][0].verification.token);
        should.not.exist(sendStub.args[0][0].resetPassword.token);
      });
    });

    it('should send a 403 if the user isnt allowed to create users', () => {
      req.user = mockUser;

      setupAllResolve();

      return userController.create(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 403 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 and the error if validation fails', () => {
      saveStub.rejects({ errors: { email: { message: 'Path `email` is required.' } } });

      return userController.create(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: { email: { message: 'Path `email` is required.' } } } ]]);
      });
    });

    it('should send a 500 if save fails', () => {
      saveStub.rejects(new Error('Save failed'));
      
      return userController.create(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });

  describe('#update', () => {
    const queryId = 'id';

    beforeEach(() => {
      req.body = {
        _id: queryId,
        email: ''
      };
    });

    afterEach(() => {

    });

    function setupAllResolve() {
      setupFindOneResolves();
      setupSaveResolves();
    }

    function setupFindOneResolves() {
      usersMock.expects('findOne')
        .chain('exec')
        .resolves(mockUser);
    }

    function setupSaveResolves() {
      saveStub.resolves(mockUser);
    }

    it('should return a promise', () => {
      setupAllResolve();

      userController.update(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use Users.findOne', () => {
      usersMock.expects('findOne').withExactArgs({ _id: queryId })
        .chain('exec')
        .resolves(mockUser);
      setupSaveResolves();

      return userController.update(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should use user.save', () => {
      setupAllResolve();

      return userController.update(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should send a 200 and sanitized user on success', () => {
      setupAllResolve();

      return userController.update(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
        sendStub.args.length.should.equal(1);
        sendStub.args[0].length.should.equal(1);
        should.not.exist(sendStub.args[0][0].password);
        should.not.exist(sendStub.args[0][0].verification.token);
        should.not.exist(sendStub.args[0][0].resetPassword.token);
      });
    });

    it('should send a 400 if validation fails', () => {
      setupFindOneResolves();
      saveStub.rejects({ errors: { email: 'Email required' } });

      return userController.update(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: { email: 'Email required' } } ]]);
      });
    });

    it('should send a 400 if id is missing', () => {
      req.body._id = undefined;
      
      return userController.update(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Missing user._id' } ]]);
      });
    });

    it('should send a 404 if the user doesnt exist', () => {
      usersMock.expects('findOne')
        .chain('exec')
        .resolves(null);

      return userController.update(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 404 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if findOne fails', () => {
      usersMock.expects('findOne')
        .rejects(new Error('findOne failed'));

      return userController.update(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if save fails', () => {
      setupFindOneResolves();
      saveStub.rejects(new Error('Save failed'));
      
      return userController.update(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });

  describe('#readList', () => {
    const users = 'ann,frank,joe,bob';
    let userList;

    beforeEach(() => {
      userList = [
        JSON.parse(JSON.stringify(mockUser)),
        JSON.parse(JSON.stringify(mockUser)),
        JSON.parse(JSON.stringify(mockUser))
      ];
      
      req.params = {
        userList: users
      };
    });

    function setupAllResolve() {
      setupFindResolves();
    }

    function setupFindResolves() {
      usersMock.expects('find')
        .chain('select')
        .chain('exec')
        .resolves(userList);
    }
    it('should return a promise', () => {
      setupAllResolve();

      userController.readList(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use Users.find', () => {
      usersMock.expects('find').withExactArgs({ _id: { $in: users.split(',') } })
        .chain('select')
        .chain('exec')
        .resolves(userList);

      return userController.readList(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should send a 200 and the sanitized users on success', () => {
      setupAllResolve();

      return userController.readList(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);

        sendStub.args.length.should.equal(1);
        sendStub.args[0].length.should.equal(1);
        sendStub.args[0][0].length.should.equal(userList.length);

        sendStub.args[0][0].forEach((sentUser) => {
          should.not.exist(sentUser.password);
          should.not.exist(sentUser.verification.token);
          should.not.exist(sentUser.resetPassword.token);
        });
      });
    });

    it('should send a 500 if find fails', () => {
      usersMock.expects('find')
        .chain('select')
        .chain('exec')
        .rejects(new Error('Find failed'));

      return userController.readList(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });
  
  describe('#deleteUser', () => {
    beforeEach(() => {
      req.params = {
        userId: mockUser._id
      };
    });

    function setupAllResolve() {
      setupFindOneRemoveResolves();
    }

    function setupFindOneRemoveResolves() {
      usersMock.expects('findOne')
        .chain('remove')
        .resolves({ numAffected: 1 }); // or something like this
    }
    
    it('should return a promise', () => {
      setupAllResolve();

      userController.deleteUser(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use Users.findOne.remove', () => {
      usersMock.expects('findOne').withExactArgs({ _id: mockUser._id })
        .chain('remove')
        .resolves({ numAffected: 1 }); // or something like this

      return userController.deleteUser(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should send a 204 on success', () => {
      setupAllResolve();

      return userController.deleteUser(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 403 if the user is not authorized to delete the user', () => {
      setupAllResolve();
      req.user = mockUser;

      return userController.deleteUser(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 403 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if findOne.remove fails', () => {
      usersMock.expects('findOne')
        .chain('remove')
        .rejects(new Error('findOneRemove failed'));

      return userController.deleteUser(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });

  describe('#adminUpdate', () => {
    let hashPasswordStub;

    beforeEach(() => {
      req.body = {
        _id: 'look at me',
        firstName: 'first',
        lastName: 'last'
      };

      hashPasswordStub = sinon.stub(mockSharedModule.authHelpers, 'hashPassword');
    });

    afterEach(() => {
      hashPasswordStub.restore();
    });

    function setupAllResolve() {
      setupHashPasswordResolves();
      setupUpdateResolves();
    }

    function setupHashPasswordResolves() {
      hashPasswordStub.resolves('hash');
    }

    function setupUpdateResolves() {
      usersMock.expects('update')
        .chain('exec')
        .resolves([ mockUser ]);
    }
    
    it('should return a promise', () => {
      setupAllResolve();

      userController.adminUpdate(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should use authHelpers.hashPassword if password is to be updated', () => {
      setupAllResolve();

      req.body.password = 'newpass';

      return userController.adminUpdate(req, res, next).then((data) => {
        hashPasswordStub.args.should.deep.equal([[ 'newpass' ]]);
      });
    });

    it('should not use authHelpers.hashPassword if password is not to be updated', () => {
      setupAllResolve();

      req.body.password = undefined;

      return userController.adminUpdate(req, res, next).then((data) => {
        hashPasswordStub.args.should.deep.equal([]);
      });
    });

    it('should use Users.update', () => {
      setupHashPasswordResolves();
      usersMock.expects('update')
        .withExactArgs({ _id: 'look at me' }, { $set: { firstName: 'first', lastName: 'last', updated: new Date() } })
        .chain('exec')
        .resolves([ mockUser ]);

      return userController.adminUpdate(req, res, next).then((data) => {
        usersMock.verify();
      });
    });

    it('should send a 200 and the sanitized user on success', () => {
      setupAllResolve();

      return userController.adminUpdate(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 200 ]]);
        
        sendStub.args.length.should.equal(1);
        sendStub.args[0].length.should.equal(1);
        sendStub.args[0][0].length.should.equal(1);

        should.not.exist(sendStub.args[0][0][0].password);
        should.not.exist(sendStub.args[0][0][0].verification.token);
        should.not.exist(sendStub.args[0][0][0].resetPassword.token);
      });
    });

    it('should send a 500 if hash fails', () => {
      req.body.password = 'newpass';

      hashPasswordStub.rejects(new Error('hash failed'));

      return userController.adminUpdate(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if update fails', () => {
      setupHashPasswordResolves();
      usersMock.expects('update')
        .chain('exec')
        .rejects(new Error('update failed'));

      return userController.adminUpdate(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });
});
