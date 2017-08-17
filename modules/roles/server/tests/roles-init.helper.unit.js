/* Testbench */
const chai = require('chai');
const should = chai.should();

const sinon = require('sinon');
require('sinon-mongoose');

const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

require('../models/Roles');
const Roles = mongoose.model('Roles');

const mockRole = {
  _id: 'mockrole',
  parent: null,
  canModify: false,
  permissions: [],
  lastUpdated: 'something'
};

const mockRoutes = {
  test: [
    {
      route: '/blah',
      type: 'GET'
    },
    {
      route: '/blah2',
      type: 'POST'
    }
  ],
  test2: [
    {
      route: '/test',
      type: 'DELETE'
    }
  ]
};

const RoleManager = require('../controllers/role-manager.controller');

/* UUT */
const RolesInitHelper = require('../controllers/roles-init.helper');

describe('rolesInitHelper', () => {
  let rolesInitHelper;
  let roleManager;

  const mockLogger = {
    info: () => {},
    error: () => {}
  };

  beforeEach(() => {
    roleManager = new RoleManager(mockLogger);
    rolesInitHelper = new RolesInitHelper(mockLogger, roleManager, mockRoutes);
  });

  describe('#createInitialRoles', () => {
    const singleRoleTree = {
      name: 'root',
      children: [],
      permissions: [
        {
          module: 'test',
          allow: [],
          forbid: []
        }
      ]
    };
    
    const childrenRoleTree = {
      name: 'root',
      children: [
        {
          name: 'child',
          children: []
        },
        {
          name: 'child2',
          children: []
        }
      ]
    };

    const childrenRoleTreeChildNames = [ 'child', 'child2' ];

    let createInitialRoleStub;
    let createInitialRolesStub;

    beforeEach(() => {
      createInitialRoleStub = sinon.stub(rolesInitHelper, 'createInitialRole');
      createInitialRolesStub = sinon.stub(rolesInitHelper, 'createInitialRoles').callThrough();
    });

    afterEach(() => {
      createInitialRoleStub.restore();
      createInitialRolesStub.restore();
    });

    it('should return a promise', () => {
      createInitialRoleStub.resolves();

      rolesInitHelper.createInitialRoles(singleRoleTree).constructor.name.should.equal('Promise');
    });

    it('should call createInitalRole with the root of the tree', () => {
      createInitialRoleStub.resolves();

      return rolesInitHelper.createInitialRoles(singleRoleTree).then(() => {
        createInitialRoleStub.args.should.deep.equal([[
          singleRoleTree.name,
          null,
          [],
          singleRoleTree.permissions
        ]]);
      });
    });

    it('should call createInitialRole with child names if they exist', () => {
      createInitialRoleStub.resolves();

      // the first call is the test, dont care about the others
      createInitialRolesStub.onCall(1).resolves();
      createInitialRolesStub.onCall(2).resolves();
      
      return rolesInitHelper.createInitialRoles(childrenRoleTree).then(() => {
        createInitialRoleStub.args[0].should.deep.equal([
          childrenRoleTree.name,
          null,
          childrenRoleTreeChildNames,
          undefined
        ]);
      });
    });

    it('should call createInitialRoles with its children if they exist', () => {
      createInitialRoleStub.resolves();
      
      createInitialRolesStub.onCall(1).resolves();
      createInitialRolesStub.onCall(2).resolves();

      return rolesInitHelper.createInitialRoles(childrenRoleTree).then(() => {
        createInitialRolesStub.args.should.deep.equal([[
          childrenRoleTree
        ], [
          childrenRoleTree.children[0],
          childrenRoleTree.name
        ], [
          childrenRoleTree.children[1],
          childrenRoleTree.name
        ]]);
      });
    });
  });

  describe('#createInitialRole', () => {
    let countStub, execStub, saveStub, isRouteAllowedStub, getEndpointHashStub, pruneEndpointDetailsStub;

    beforeEach(() => {
      execStub = sinon.stub();
      countStub = sinon.stub(Roles, 'count');
      saveStub = sinon.stub(Roles.prototype, 'save');
      isRouteAllowedStub = sinon.stub(rolesInitHelper, 'isRouteAllowed');
      getEndpointHashStub = sinon.stub(roleManager, 'getEndpointHash');
      pruneEndpointDetailsStub = sinon.stub(roleManager, 'pruneEndpointDetails');
    });

    afterEach(() => {
      countStub.restore();
      saveStub.restore();
      isRouteAllowedStub.restore();
      getEndpointHashStub.restore();
      pruneEndpointDetailsStub.restore();
    });

    function setupAllResolve() {
      setupCountResolves();
      setupSaveResolves();
      setupIsRouteAllowedResolves();
      setupGetEndpointHashResolves();
      setupPruneEndpointDetailsResolves();
    }

    function setupCountResolves() {
      countStub.returns({ exec: execStub });
      execStub.resolves(0);
    }

    function setupSaveResolves() {
      saveStub.resolves(mockRole);
    }

    function setupGetEndpointHashResolves() {
      getEndpointHashStub.returns('hash');
    }

    function setupPruneEndpointDetailsResolves() {
      pruneEndpointDetailsStub.returns('pruned');
    }

    function setupIsRouteAllowedResolves() {
      isRouteAllowedStub.returns(true);
    }

    it('should call isRouteAllowed for each route in a module specified in config', () => {
      setupAllResolve();

      const permissions = [
        {
          module: 'test',
          allow: [],
          forbid: []
        },
        {
          module: 'test2',
          allow: [],
          forbid: []
        }
      ];

      rolesInitHelper.createInitialRole('name', null, undefined, permissions);

      isRouteAllowedStub.args.should.deep.equal([[
        mockRoutes[permissions[0].module][0],
        permissions[0].allow,
        permissions[0].forbid
      ], [
        mockRoutes[permissions[0].module][1],
        permissions[0].allow,
        permissions[0].forbid
      ], [
        mockRoutes[permissions[1].module][0],
        permissions[1].allow,
        permissions[1].forbid
      ]]);
    });

    it('should throw an error if a config module does not exist', () => {
      setupAllResolve();

      const permissions = [
        {
          module: 'idontexist',
          allow: [],
          forbid: []
        }
      ];

      should.throw(() => {
        rolesInitHelper.createInitialRole('name', null, undefined, permissions)
      });
    });

    it('should use get the hash of each allowed endpoint', () => {
      setupAllResolve();

      const permissions = [
        {
          module: 'test',
          allow: [],
          forbid: []
        }
      ];

      rolesInitHelper.createInitialRole('name', null, undefined, permissions);

      pruneEndpointDetailsStub.args.should.deep.equal([[
        mockRoutes[permissions[0].module][0],
      ], [
        mockRoutes[permissions[0].module][1]
      ]]);
      getEndpointHashStub.args.should.deep.equal([[ 'pruned' ], [ 'pruned' ]]);
    });

    it('should return a promise', () => {
      setupAllResolve();

      rolesInitHelper.createInitialRole('name', null).constructor.name.should.equal('Promise');
    });

    it('should use Roles.count', () => {
      setupAllResolve();

      rolesInitHelper.createInitialRole('name', null).then((data) => {
        countStub.args.should.deep.equal([[ { _id: 'name', parent: null } ]]);
        execStub.called.should.equal(true);
      });
    });

    it('should use the save stub if count is 0', () => {
      setupAllResolve();

      rolesInitHelper.createInitialRole('name', null).then((data) => {
        saveStub.called.should.equal(true);
      });
    });

    it('should not use the save stub if count is not 0', () => {
      countStub.returns({ exec: execStub });
      execStub.resolves(1);

      rolesInitHelper.createInitialRole('name', null).then((data) => {
        saveStub.called.should.equal(false);
      });
    });
  });

  describe('#isRouteAllowed', () => {
    const route = {
      type: 'GET',
      route: '/test'
    };
    let allow = [];
    let forbid = [];
    
    const routeString = 'GET/test';

    let containsMatchStub;

    beforeEach(() => {
      containsMatchStub = sinon.stub(rolesInitHelper, 'containsMatch');
    });

    afterEach(() => {
      containsMatchStub.restore();
    });

    it('should call containsMatch with the allow list then the forbid list', () => {
      allow = [ 'a', /b/ ];
      forbid = [ /c/ ];

      // dont really care for this test
      containsMatchStub.returns(true);

      rolesInitHelper.isRouteAllowed(route, allow, forbid);

      containsMatchStub.args.should.deep.equal([
        [ routeString, allow ],
        [ routeString, forbid ]
      ]);
    });

    it('should return true if the route is explicitly allowed', () => {
      containsMatchStub.onCall(0).returns(true);
      containsMatchStub.onCall(1).returns(false);

      rolesInitHelper.isRouteAllowed(route, allow, forbid).should.equal(true);
    });

    it('should return false if the route is not explicitly allowed or forbidden', () => {
      containsMatchStub.onCall(0).returns(false);
      containsMatchStub.onCall(1).returns(true);

      rolesInitHelper.isRouteAllowed(route, allow, forbid).should.equal(false);
    });

    it('should return false if the route is explicitly allowed and forbidden', () => {
      containsMatchStub.onCall(0).returns(true);
      containsMatchStub.onCall(1).returns(true);

      rolesInitHelper.isRouteAllowed(route, allow, forbid).should.equal(false);
    });
  });

  describe('#containsMatch', () => {
    const routeString = 'GET/test';
    let postRegExp = /POST.*/;
    let getRegExp = /GET.*/;
    let deleteRegExp = /DELETE.*/;

    let regExps = [
      postRegExp,
      getRegExp,
      deleteRegExp
    ];

    it('should return false if expressions is empty', () => {
      rolesInitHelper.containsMatch(routeString, []).should.equal(false);
    });

    it('should return true if a string equals the routeString', () => {
      rolesInitHelper.containsMatch(routeString, [ 'GET/test' ]).should.equal(true);
    });

    it('should return true if a RegExp tests equal to the routeString', () => {
      rolesInitHelper.containsMatch(routeString, [ /GET.*/ ]).should.equal(true);
    });

    it('should throw an error if a different type is passed in the expressions list', () => {
      should.throw(() => { rolesInitHelper.containsMatch(routeString, [ 0 ])});
    });

    it('should test each element until it finds a match', () => {
      testPostStub = sinon.stub(postRegExp, 'test').returns(false);
      testGetStub = sinon.stub(getRegExp, 'test').returns(true);
      testDeleteSpy = sinon.spy(deleteRegExp, 'test');

      rolesInitHelper.containsMatch(routeString, regExps).should.equal(true);

      testPostStub.called.should.equal(true);
      testGetStub.called.should.equal(true);
      testDeleteSpy.called.should.equal(false);

      testPostStub.restore();
      testGetStub.restore();
      testDeleteSpy.restore();
    });
  });
});
