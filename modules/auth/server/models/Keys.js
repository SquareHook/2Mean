/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Keys Schema
 */
var KeysSchema = new Schema({
  value: {
    type: String,
    required: 'Key value required'
  },
  created: {
    type: Date,
    required: 'Key created timestamp required'
  },
  user: {
    type: Schema.Types.ObjectId,
    required: 'Key must be linked to a user'
  },
  roles: [
    {
      type: String
    }
  ]
});

try {
  mongoose.model('Keys');
} catch (error) {
  mongoose.model('Keys', KeysSchema);
}
