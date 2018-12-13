// Branch Model Definiton.

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');

var Schema = mongoose.Schema;

var BranchSchema = new Schema({
    name:           { type: String, required: true, unique: true },
    location:       { type: String, required: true },    
    opening_date:   { type: Date, default: null },
    branch_type:    { type: String, default: '' },
    email:          { type: String, default: '' },
    phone:          { type: String, default: '' },
    status:         {type: String, enums:['active', 'inactive'], default:'active'},
    weredas:        [{ type: Schema.Types.ObjectId, ref: 'Wereda'}],
    geolocation:    {
      longitude: { type: Number, default: 0.0 },
      latitude:  { type: Number, default: 0.0 }
    },
    date_created:   { type: Date },
    last_modified:  { type: Date }
});

// add mongoose-troop middleware to support pagination
BranchSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
BranchSchema.pre('save', function preSaveMiddleware(next) {
  var instance = this;

  // set date modifications
  var now = moment().toISOString();

  instance.date_created = now;
  instance.last_modified = now;

  next();

});

/**
 * Filter Branch Attributes to expose
 */
BranchSchema.statics.attributes = {
  _id: 1,
  name: 1,
  location: 1,
  opening_date: 1,
  branch_type: 1,
  email: 1,
  phone: 1,
  status: 1,
  weredas: 1,
  geolocation: 1,
  date_created: 1,
  last_modified: 1
};


// Expose Branch model
module.exports = mongoose.model('Branch', BranchSchema);
