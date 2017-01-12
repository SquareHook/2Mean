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
  title: {
  	type: String,
  	default: "untitled"
  },
  content: {
    type: String,
    default: "nothing here yet"
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  userName: String,
  userId: Schema.ObjectId
});

mongoose.model('Article', ArticleSchema);
