'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * User Schema
 */
var ArticleSchema = new Schema({

  resetPasswordExpires: {
    type: Date
  }
});

mongoose.model('Article', ArticleSchema);
