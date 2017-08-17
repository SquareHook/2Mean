/* Testbench */
const chai = require('chai');
const should = chai.should();
chai.config.includeStack = true;

const sinon = require('sinon');
require('sinon-mongoose');

const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

require('../models/Roles');
const Roles = mongoose.model('Roles');

/* Modules to inject */
const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  crit: () => {}
};

const mockUserModule = {

};

const mockModuleLoader = {
  getRoutes: () => {
    return {
      blah: [
        {
          type: 'GET',
          route: '/blah'
        }
      ]
    }
  }
};

const mockUser = {
  _id: new ObjectID(),
  email: 'a@b',
  username: 'a'
};

const mockRole = {
  _id: 'mockrole',
  parent: null,
  canModify: false,
  permissions: [],
  lastUpdated: 'some date'
};


/* UUT */
const RolesController = require('../controllers/roles.controller');

describe('RolesController', () => {
  let rolesController;

  // commonly needed stubs
  let req, res, next;
  let saveStub;
  let statusStub;
  let sendStub;
  let rolesMock;

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

    rolesController = new RolesController(mockLogger, mockUserModule, mockModuleLoader);
    
    rolesMock = sinon.mock(Roles);

    req.user = mockUser;
    saveStub = sinon.stub(Roles.prototype, 'save');
    mockRole.save = saveStub;
  });

  afterEach(() => {
    rolesMock.restore();
    saveStub.restore();
  });

  describe('#updateSingleRole', () => {
    beforeEach(() => {
      req.body = mockRole;
      req.params = {
        roleId: mockRole._id
      };
    });

    afterEach(() => {

    });

    function setupAllResolve() {
      setupFindOneResolves();
      setupSaveResolves();
    }

    function setupFindOneResolves() {
      rolesMock.expects('findOne')
        .chain('exec')
        .resolves(mockRole);
    }

    function setupSaveResolves() {
      saveStub.resolves(mockRole);
    }

    it('should return a promise', () => {
      setupAllResolve();

      rolesController.updateSingleRole(req, res, next).constructor.name.should.equal('Promise');
    });

    it('should use Roles.findOne', () => {
      rolesMock.expects('findOne')
        .withExactArgs({ _id: mockRole._id })
        .chain('exec')
        .resolves(mockRole);
      setupSaveResolves();

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        rolesMock.verify();
      });
    });

    it('should use Roles.prototype.save', () => {
      setupAllResolve();

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should send a 204 on success', () => {
      setupAllResolve();

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 204 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 404 if the role does not exist', () => {
      rolesMock.expects('findOne')
        .chain('exec')
        .resolves(null);

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 404 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 400 if the role is not in the body', () => {
      req.body = undefined;

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: 'Missing role' } ]]);
      });
    });

    it('should send a 400 if the role validation fails', () => {
      const validationError = { errors: { path: { message: 'Path `path` is required' } } };
      setupFindOneResolves();
      saveStub.rejects(validationError);

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 400 ]]);
        sendStub.args.should.deep.equal([[ { error: validationError.errors } ]])
      });
    });

    it('should send a 500 if Roles.findOne fails', () => {
      rolesMock.expects('findOne')
        .chain('exec')
        .rejects(new Error('findOne failed'));

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should send a 500 if Roles.prototype.save fails', () => {
      setupFindOneResolves();
      saveStub.rejects(new Error('save failed'));

      return rolesController.updateSingleRole(req, res, next).then((data) => {
        statusStub.args.should.deep.equal([[ 500 ]]);
        sendStub.args.should.deep.equal([[ ]]);
      });
    });
  });
});
