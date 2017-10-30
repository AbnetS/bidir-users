// SuperAdmin Model Definiton.

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');

var Schema = mongoose.Schema;

var SuperAdminSchema = new Schema({  
    account:        { type: Schema.Types.ObjectId, ref:'Account'},  
    realm:          { type: String, default:"superadmin"},  
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
SuperAdminSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
SuperAdminSchema.pre('save', function preSaveMiddleware(next) {
  var instance = this;

  // set date modifications
  var now = moment().toISOString();

  instance.date_created = now;
  instance.last_modified = now;

  next();

});

/**
 * Filter SuperAdmin Attributes to expose
 */
SuperAdminSchema.statics.whitelist = {
  __v: 0
};


// Expose SuperAdmin model
module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);
