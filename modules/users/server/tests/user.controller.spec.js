process.env.NODE_ENV = 'test';
process.env.TOOMEAN_LOG_LEVEL = 'error';

/* Test Bench */
var path = require('path');
var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
chai.use(chaiHttp);

/* TODO set up serverside testing to instantiate only UUT and inject
 * mocked dependencies
 */
/* Unit Under Test */
var server = require(path.resolve('server'));;

/* Dependencies */
var argon2 = require('argon2');
var mongoose = require('mongoose');

var Users = mongoose.model('User');
var Keys = mongoose.model('Keys');

var logger = require(path.resolve('modules/logger/server/index'));

/* Mocked dependencies */
var mockLogger = logger;

/**
 * Test the crud/user cred endpoints
 */
describe('UserController', () => {
  var creds, user;

  before((done) => {
    done();
  });

  beforeEach((done) => {
    // Wipe out users collection
    Users.remove({}, (err) => {

    });
    
    // valid credentials
    creds = {
      username: 'user',
      password: '123ABCabc-'
    };

    // Add a test user
    var _user = {
      firstName: 'first',
      lastName: 'last',
      displayName: 'first last',
      email: 'first.last@example.com',
      username: creds.username,
      roles: ['admin', 'user']
    };

    // Create password hash
    argon2.generateSalt().then(salt => {
      argon2.hash(creds.password, salt).then(hash => {
        _user.password = hash;

        user = new Users(_user);
        
        user.save((err) => {
          if (err) {
            done(err);
          } else {
            // log the created user in
            var agent = chai.request.agent(server);
            agent
              .post('/api/login')
              .send(creds)
              .end((err, res) => {
                // For some reason the chai-http cookies functionality
                // is not working
                res.headers['set-cookie'][0].should.contain('apikey=' + res.body.apikey);
                done();
              });
          }
        });
      });
    });
  });

  // /api/users GET
  describe('#read', () => {
    beforeEach(() => {
    });

    it('should be secure', (done) => {
      /* log the user out (invalidate serverside key and try to 
       * get the user which exists)
       */
      Keys.remove({}, (err) => {
          chai.request(server)
            .get('/api/users/' + user._id)
            .end((err, res) => {
              res.should.have.status(400);
              res.text.should.equal('Unauthorized');
              done();
          });
      });
    });

    it('should use a userId url parameter and return a User', (done) => {
      /* send a request to the correct endpoint with an id that is in
       * the database
       */
      chai.request(server)
        .get('/api/users/' + user._id)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('should return an error if the user does not exist', (done) => {
      /* send a request to th correct endpoint but with an id that
       * is not in the database
       */
      chai.request(server)
        .get('/api/users/1')
        .end((err, res) => {
          res.should.have.status(500);
        });
    });
  });

  /* /api/users POST
   */
  describe('#create', () => {
    beforeEach(() => {

    });

    it('should be secure', (done) => {
      /* log the user out (invalidate serverside key and try to post a new
       * user
       */
      Keys.remove({}, (err) => {
        chai.request(server)
          .post('/api/users/')
          .send(user)
          .end((err, res) => {
            res.should.have.status(400)
            res.text.should.equal('Unauthorized');
            done();
          });
      });
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
    beforeEach(() => {

    });

    it('should be secure', (done) => {
      /* log the user out (invalidate the serverside key) and try to update
       * the existing user
       */
      Keys.remove({}, (err) => {
        chai.request(server)
          .put('/api/users/')
          .send(user)
          .end((err, res) => {
            res.should.have.status(400)
                res.text.should.equal('Unauthorized');
            done();
          });
      });
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
    beforeEach(() => {

    });

    it('should be secure', (done) => {
      /* log the user out (invalidate the serverside key) and try to delete
       * the existing user
       */
      Keys.remove({}, (err) => {
        chai.request(server)
          .delete('/api/users/' + user._id)
          .end((err, res) => {
            res.should.have.status(400)
                res.text.should.equal('Unauthorized');
            done();
          });
      });
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
    beforeEach(() => {

    });

    it('should not be secure', (done) => {
      /* log the user out (invalidate the serverside key) and try to register
       * a new user
       */
      Keys.remove({}, (err) => {
        chai.request(server)
          .post('/api/users/register/')
          .send({
            id: null,
            firstName: null,
            lastName: null,
            displayName: null,
            username: 'new',
            email: 'new@new',
            password: '123ABCabc-',
            profileImageURL: null,
            roles: null
          })
          .end((err, res) => {
            res.should.have.status(201);
            done();
          });
      });
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
    beforeEach(() => {

    });

    it('should be secure', (done) => {
      /* log the user out (invalidate the serverside key) and try to 
       * change the existing users profile picture
       */
      Keys.remove({}, (err) => {
        // TODO file upload
        chai.request(server)
          .post('/api/users/picture')
          .send({})
          .end((err, res) => {
            res.should.have.status(400)
                res.text.should.equal('Unauthorized');
            done();
          });
      });
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
    beforeEach(() => {

    });

    it('should be secure', (done) => {
      /* log the user out (invalidate the serverside key) and try to
       * get the existing user's profile picture
       */
      Keys.remove({}, (err) => {
        // TODO file name
        chai.request(server)
          .get('/api/users/' + user._id + '/picture/blah.png')
          .end((err, res) => {
            res.should.have.status(400)
                res.text.should.equal('Unauthorized');
            done();
          });
      });
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
    const validPasswords = [
      { data: '123ABCabc-', desc: 'Digit UPPER lower symbol' },
      { data: 'ABCabc-123', desc: 'UPPER lower symbol digit' },
      { data: 'abc-123ABC', desc: 'lower symbol digit UPPER' },
      { data: '-123ABCabc', desc: 'symbol digit UPPER lower' },
      { data: 'abc 123ABC', desc: 'whitespace are valid symbols' },
    ];
    const invalidPasswords = [
      { data: '', desc: 'empty' },
      { data: 'a', desc: 'too short' },
      { data: 'abc123----', desc: 'no UPPER' },
      { data: 'abcABC----', desc: 'no digit' },
      { data: 'ABC123----', desc: 'no lower' },
      { data: 'ABCabc1234', desc: 'no symbol' }
    ];

    beforeEach(() => {

    });
    
    it('should be secure', (done) => {
      /* log the user out (invalidate the serverside key) and try to
       * change the user's password
       */
      Keys.remove({}, (err) => {
        chai.request(server)
          .put('/api/users/changePassword')
          .send({ passwordOld: '123', passwordNew: '123' })
          .end((err, res) => {
            res.should.have.status(400)
                res.text.should.equal('Unauthorized');
            done();
          });
      });
    });

    it('should have the oldPassword and newPassword in the body change the password and return the User', 
      (done) => {
        var i;
        // Test each valid password
        for (i = 0; i < validPasswords.length; i++) {
          var validPassword = validPasswords[i].data;

          // Send the request
          chai.request(server)
            .put('/api/users/changePassword')
            .send({ 
              passwordOld: creds.password, 
              passwordNew: validPassword
            })
            .end((err, res) => {
              // Was the requset successful
              res.should.have.status(201);

              // Did the server return the updated User
              res.body.should.exist();
              res.body.password.should.exist();

              // Did the server change the password
              argon2.verify(res.body.password, validPassword, (match) => {
                match.should.equal(true);
              });
            });
        }
      }
    );

    it('should return an error if the password is not strong enough', (done) => {
      var i;
      // Test each invalid password
      for (i = 0; i < invalidPasswords.length; i++) {
        var invalidPassword = invalidPasswords[i].data;

        // Send the request
        chai.request(server)
          .put('/api/users/changePassword')
          .send({
            passwordOld: creds.password,
            passwordNew: invalidPassword
          })
          .end((err, res) => {
            // Was the request not sucessful
            res.should.have.status(500);
          });
      }
    });

    it('should not store the password in the clear', (done) => {
      var validPassword = validPasswords[0].data;
      
      chai.request(server)
        .put('/api/users/changePassword')
        .send({
          passwordOld: creds.password,
          passwordNew: validPassword
        })
        .end((err, res) => {
          res.should.have.status(201);
          Users.findOne({ _id: user._id }, (err, data) => {
            data.password.should.not.equal(creds.password);
            done();
          });
        });
    });

    it('should return an error if the user sends the wrong old password', (done) => {
      var validPassword = validPasswords[0].data;

      chai.request(server)
        .put('/api/users/changePassword')
        .send({
          passwordOld: '',
          passwordNew: validPassword
        })
        .end((err, res) => {
          res.should.have.status(500);
        });
    });

    it('should return an error if the save fails', (done) => {
      assert.equal('not', 'implemented');
    });
  });
});
