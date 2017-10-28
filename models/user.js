// User Model Definiton.

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    branch:         { type: Schema.Types.ObjectId, ref:'Branch'},
    account:        { type: Schema.Types.ObjectId, ref:'Account'},
    title:          { type: String },
    first_name:     { type: String, required: true },
    middle_name:    { type: String },    
    last_name:      { type: String },   
    email:          { type: String },
    phone:          { type: String },
    status:         { type: String, enums:['active', 'inactive'], default:'inactive'},
    date_created:   { type: Date },
    last_modified:  { type: Date }
});

// add mongoose-troop middleware to support pagination
UserSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
UserSchema.pre('save', function preSaveMiddleware(next) {
  var instance = this;

  // set date modifications
  var now = moment().toISOString();

  instance.date_created = now;
  instance.last_modified = now;

  next();

});

/**
 * Filter User Attributes to expose
 */
UserSchema.statics.whitelist = {
  __v: 0
};


// Expose User model
module.exports = mongoose.model('User', UserSchema);
