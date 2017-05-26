const chai = require('chai');
const should = chai.should();
chai.config.includeStack = true;

const sinon = require('sinon');

const mockLogger = {};

const SharedController = require('../controllers/shared.controller');

describe('SharedController', () => {
  let req, res, next;
  let sharedController;

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

    sharedController = new SharedController(mockLogger);
  });

  describe('#apiCanary', () => {
    it('should return a promise', () => {
      sharedController.apiCanary(req, res, next).constructor.name
        .should.equal('Promise');
    });

    it('should send a 200', () => {
      return sharedController.apiCanary(req, res, next).then(() => {
        statusStub.args.should.deep.equal([[ 200 ]]);
      });
    });
  });
});
