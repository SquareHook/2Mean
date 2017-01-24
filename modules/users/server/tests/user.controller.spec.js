var chai = require('chai');
var assert = chai.assert;

/* Unit Under Test */
var userController = require('../controllers/user.controller');

/**
 * Test the crud/user cred endpoints
 */
describe('UserController', () => {
  describe('#read', () => {
    it('should be secure', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should use a userId url parameter and return a User', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the user does not exist', (done) => {
      assert.equal('not', 'implemented');
    });
  });

  describe('#create', () => {
    it('should be secure', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should have a user in the body and create a User and return that User',
      (done) => {
        assert.equal('not', 'implemented');
      }
    );

    it('should return an error if the User is invalid', (done) => {
      assert.equal('not', 'implemented');
    });
  });
  
  describe('#update', () => {
    it('should be secure', (done) => {
      assert.equal('not', 'implemented');
    });

    it('hould have a user in the body and update that User and return that User',
      (done) => {
        assert.equal('not', 'implemented');
      }
    );

    it('should return an error if the User is invalid', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the User does not exist', (done) => {
      assert.equal('not', 'implemented');
    });
  });

  describe('#deleteUser', () => {
    it('should be secure', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should use a userId url parameter and delete a User and return that User',
      (done) => {
        assert.equal('not', 'implemented');
      }
    );

    it('should return an error if the user does not exist', (done) => {
      assert.equal('not', 'implemented');
    });
  });

  describe('#register', () => {
    it('should not be secure', (done) => {
      assert.equal('not', 'equal');
    });

    it('should have a user in the body and create a new user and return that User', 
      (done) => {
        assert.equal('not', 'implemented');
      }
    );

    it('should return an error if the user is not valid', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the User creation fails', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should not store the password in the clear', (done) => {
      assert.equal('not', 'implemented');
    });
  });

  describe('#changeProfilePicture', () => {
    it('should be secure', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should save the upload locally if the local strategy is used', (done) => {
      assert.equal('not', 'implemeneted');
    });

    it('should save the upload on S3 if the S3 strategy is used', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the strategy if not valid', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the file is too big', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the file is of the wrong type', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should unlink the old photo if the upload is sucessfull', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should update the user and return the User', (done) => {
      assert.equal('not', 'implemented');
    });
  });

  describe('#getProfilePicture', () => {
    it('should be secure', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should use a userId url parameter and a fileName url parameter and send an image',
      (done) => {
        assert.equal('not', 'implemented');
      }
    );

    it('should return an error is the local strategy is not in use', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the requested file does not exist', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the user does not exist', (done) => {
      assert.equal('not', 'implemented');
    });
  });

  describe('#changePassword', () => {
    it('should have the oldPassword and newPassword in the body change the password and return the User', 
      (done) => {
        assert.equal('not', 'implemented');
      }
    );

    it('should return an error if the password is not strong enough', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should not store the password in the clear', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the user is not valid', (done) => {
      assert.equal('not', 'implemented');
    });

    it('should return an error if the save fails', (done) => {
      assert.equal('not', 'implemented');
    });
  });
});
