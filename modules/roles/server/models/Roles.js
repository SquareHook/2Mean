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
  canModify: Boolean,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  permissions: [
    {
      asset: String
    }
  ]
});

mongoose.model('Roles', RolesSchema);
