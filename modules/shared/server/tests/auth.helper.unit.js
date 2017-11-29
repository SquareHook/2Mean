/* Testbench */
const chai = require('chai');
const should = chai.should();
chai.config.includeStack = true;

const sinon = require('sinon');

const argon2 = require('argon2');

const uuid = require('uuid');

const proxyquire = require('proxyquire');

const AuthHelpers = require('./../controllers/auth.helpers');

describe('AuthHelpers', () => {
  let mockLogger;
  let authHelpers;
  
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

  beforeEach(() => {
    authHelpers = new AuthHelpers(mockLogger);
  });

  afterEach(() => {

  });

  describe('#hashPassword', () => {
    const salt = 'salt';
    const hash = 'hash';
    const saltError = new Error('salt failed');
    const hashError = new Error('hash failed');

    const clearText = 'password';

    let generateSaltStub, hashStub;

    beforeEach(() => {
      generateSaltStub = sinon.stub(argon2, 'generateSalt');
      hashStub = sinon.stub(argon2, 'hash');
    });

    afterEach(() => {
      generateSaltStub.restore();
      hashStub.restore();
    });

    function setupAllResolve() {
      generateSaltStub.resolves(salt);
      hashStub.resolves(hash);
    }

    it('should return a promise', () => {
      setupAllResolve();

      authHelpers.hashPassword(clearText).constructor.name.should.equal('Promise');
    });

    it('should use argon2.generateSalt', () => {
      setupAllResolve();

      return authHelpers.hashPassword(clearText).then((hashed) => {
        // called once with no args
        generateSaltStub.args.should.deep.equal([[ ]]);
      });
    });

    it('should use argon2.hash', () => {
      setupAllResolve();

      return authHelpers.hashPassword(clearText).then((hashed) => {
        // called once with salt and clear text
        hashStub.args.should.deep.equal([[ clearText, salt ]]);
      });
    });

    it('should resolve the hashed password if both argon2 methods succeed', () => {
      setupAllResolve();

      return authHelpers.hashPassword(clearText).then((hashed) => {
        hashed.should.equal(hash);
      });
    });

    it('should reject if argon2.generateSalt fails', () => {
      generateSaltStub.rejects(saltError);

      return authHelpers.hashPassword(clearText).then((hashed) => {
        hashed.should.equal('should not have resolved');
      }).catch((error) => {
        error.should.equal(saltError);
      });
    });

    it('should reject if argon2.hash fails', () => {
      generateSaltStub.resolves(salt);
      hashStub.rejects(hashError);

      return authHelpers.hashPassword(clearText).then((hashed) => {
        // fail
        hashed.should.equal('should not have resolved');
      }).catch((error) => {
        error.should.equal(hashError);
      });
    });
  });

  describe('#verifyPassword', () => {
    const matchData = true;
    const matchError = new Error('verify failed');

    let verifyStub;

    beforeEach(() => {
      verifyStub = sinon.stub(argon2, 'verify');
    });

    afterEach(() => {
      verifyStub.restore();
    });

    function setupAllResolve() {
      verifyStub.resolves(matchData);
    }

    it('should return a promise', () => {
      setupAllResolve();

      authHelpers.verifyPassword('hash', 'clear').constructor.name.should.equal('Promise');
    });

    it('should use argon2.verify', () => {
      setupAllResolve();

      return authHelpers.verifyPassword('hash', 'clear').then((match) => {
        verifyStub.args.should.deep.equal([[ 'hash', 'clear' ]]);
      });
    });

    it('should resolve if verify resolves', () => {
      setupAllResolve();

      return authHelpers.verifyPassword('hash', 'clear').then((match) => {
        match.should.equal(matchData);
      });
    });

    it('should reject if verify rejects', () => {
      verifyStub.rejects(matchError);

      return authHelpers.verifyPassword('hash', 'clear').then((match) => {
        match.should.equal('should not have resolved');
      }).catch((error) => {
        error.should.equal(matchError);
      });
    });
  });

  describe('#generateUniqueToken', () => {
    let uuidV4Stub;

    beforeEach(() => {
      uuidV4Stub = sinon.stub(uuid, 'v4');
    });

    afterEach(() => {
      uuidV4Stub.restore();
    });

    it('should use uuid.v4', () => {
      uuidV4Stub.returns('uuid');

      authHelpers.generateUniqueToken().should.equal('uuid');
    });
  });

  describe('#generateUrl', () => {
    let configStub;

    beforeEach(() => {
      // reset the config stub
      configStub = {
        app: {
        }
      };
    });

    function initializeUut () {
      authHelpers = proxyquire('../controllers/auth.helpers', {
        '../../../../config/config': configStub
      })(mockLogger);
    }

    it('should send the proxyUrl if it is set', () => {
      const proxyUrl = 'https://somewhere:8888';
      configStub.app.proxyUrl = proxyUrl;

      initializeUut();

      authHelpers.generateUrl().should.equal(proxyUrl);
    });

    it('should send the http url if proxyUrl is not set and force_http is false', () => {
      const host = 'host';
      const port = '8888';

      configStub.app.host = host;
      configStub.app.port_http = port;

      initializeUut();

      authHelpers.generateUrl().should.equal('http://' + host + ':' + port);
    });

    it('should send the https url if proxy url is not set and force_http is true', () => {
      const host = 'host';
      const port_http = '8888';
      const port_https = '4443';
      const force_https = true;

      configStub.app.host = host;
      configStub.app.port_http = port_http;
      configStub.app.port_https = port_https;
      configStub.app.force_https = force_https;

      initializeUut();

      authHelpers.generateUrl().should.equal('https://' + host + ':' + port_https);
    });

    it('should only attach the port if the port is not 80/443', () => {
      const host = 'host';
      const port_http = '80';

      configStub.app.host = host;
      configStub.app.port_http = port_http;

      initializeUut();

      authHelpers.generateUrl().should.equal('http://' + host);
    });

    it('should only attach the port if the port is not 443', () => {
      const host = 'host';
      const port_http = '80';
      const port_https = '443';
      const force_https = true;

      configStub.app.host = host;
      configStub.app.port_http = port_http;
      configStub.app.port_https = port_https;
      configStub.app.force_https = force_https;

      initializeUut();

      authHelpers.generateUrl().should.equal('https://' + host);
    });
  });
});
