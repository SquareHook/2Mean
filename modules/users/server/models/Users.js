'use strict';

/**
 * Module dependencies.
 */
const config = require('../../../../config/config');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  displayName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: ''
  },
  username: {
    type: String,
    unique: true,
    required: 'Please fill in a username',
    lowercase: true,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  },
  apikey: {
    value: {
      type: String
    },
    created: {
      type: Date
    }
  },
  profileImageURL: {
    type: String
  },
  providerData: {},
  additionalProvidersData: {},
  role: {
    type: String,
    default: 'user',
    required: 'Please provide a user role'
  },
  subroles:{
    type:[String],
    default:[]
  },
  updated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For verify email */
  verified: {
    type: Boolean,
    default: false
  },
  verification: {
    token: {
      type: String
    },
    expires: {
      type: Date,
      default: () => {
        // use configured ttl
        return Date.now() + config.app.emailVerificationTTL;
      }
    }
  }, resetPassword: {
    token: {
      type: String
    },
    expires: {
      type: Date,
      default: () => {
        return Date.now() + config.app.emailVerificationTTL;
      }
    }
  }
});

UserSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

UserSchema.pre('update', function(next) {
  this.updated = Date.now();
  next();
});

mongoose.model('User', UserSchema);
