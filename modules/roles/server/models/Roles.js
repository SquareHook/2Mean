'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var RolesSchema = new Schema({
  _id: {
    type: String,
    required: '_id is required. Set it to the role name'
  },
  parent: String,
  canModify: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Roles', RolesSchema);
