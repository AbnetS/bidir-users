// Account Model Definiton.

/**
 * Load Module Dependencies.
 */
const mongoose  = require ('mongoose');
const moment    = require ('moment');
const paginator = require ('mongoose-paginator');

var Schema = mongoose.Schema;

var AccountSchema = Schema ({
    user:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username:       { type: string, required: true },
    password:       { type: string, required: true },
    // roles:          [{
    //   branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    //   branch_roles:  [{ type: Schema.Types.ObjectId, ref: 'Role' }]
    // }],
    roles:          [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    date_created:   { type: Date },
    last_modified:  { type: Date }
})

// add mongoose-troop middleware to support pagination
AccountSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
AccountSchema.pre('save', function preSaveMiddleware(next) {
  var instance = this;

  // set date modifications
  var now = moment().toISOString();

  instance.date_created = now;
  instance.last_modified = now;

  next();

});

/**
 * Model Attributes to expose
 */
AccountSchema.statics.whitelist = {
  _id: 1,
  user: 1,
  username: 1,
  role: 1  
};

module.exports = mongoose.model ('Account', AccountSchema);