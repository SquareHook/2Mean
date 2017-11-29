/**
 * Class representing an Email
 */
class Email {
  /**
   * create an email
   * @param {string} text
   * @param {string} to
   * @param {string} from
   * @param {string} subject
   */
  constructor(text, to, from, subject) {
    if (!text) {
      throw new Error('Email requires text');
    }
    if (!to) {
      throw new Error('Email requires to');
    }
    if (!from) {
      throw new Error('Email requires from');
    }
    if (!subject) {
      throw new Error('Email requires subject');
    }
    
    this.text = text;
    this.to = to;
    this.from = from;
    this.subject = subject;
  }

  /**
   * convert email to simple object. Useful for using with nodemailer
   * @return {Object}
   */
  asObject() {
    return {
      text: this.text,
      to: this.to,
      from: this.from,
      subject: this.subject
    };
  }
}

module.exports = Email;
