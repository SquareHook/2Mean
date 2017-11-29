const chai = require('chai');
const should = chai.should();

/* UUT */
const Email = require('../models/email.model');

describe('Email', () => {
  const text = 'test';
  const to = 'test@example.com';
  const from = 'test@example.com';
  const subject = 'test';

  describe('#constructor', () => {
    it('should require a text', () => {
      try {
        let email = new Email(undefined, to, from, subject);
      } catch (e) {
        e.should.deep.equal(new Error('Email requires text'));
      }
    });

    it('should require a to', () => {
      try {
        let email = new Email(text, undefined, from, subject);
      } catch (e) {
        e.should.deep.equal(new Error('Email requires to'));
      }
    });

    it('should require a from', () => {
      try {  
        let email = new Email(text, to, undefined, subject);
      } catch (e) {
        e.should.deep.equal(new Error('Email requires from'));
      }
    });

    it('should require a subject', () => {
      try {
        let email = new Email(text, to, from);
      } catch (e) {
        e.should.deep.equal(new Error('Email requires subject'));
      }
    });
  });

  describe('#asObject', () => {
    it('should return an object with text,to,from,subject', () => {
      let email = new Email(text, to, from, subject);
      email.asObject().should.deep.equal({
        text: text,
        to: to,
        from: from,
        subject: subject
      });
    });
  });
});
