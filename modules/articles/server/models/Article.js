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
  _id: Schema.Types.ObjectId,
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
    type: Date
  },
  userName: String,
  userId: Schema.ObjectId
});

try {
  mongoose.model('Article');
} catch (error) {
  mongoose.model('Article', ArticleSchema);
}
