// Permission Model Definiton.

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');

var enums     = ['MFI_SETUP', 'USER_MANAGEMENT', 'SCREENING_MANAGEMENT', 'LOANS_MANAGEMENT', 'GROUPS_MANAGEMENT', 'FORMS_MANAGEMENT']

var Schema = mongoose.Schema;

var PermissionSchema = new Schema({       
    name:           { type: String, required: true },
    description:    { type: String, default: 'No Description' }, 
    entity:         { type: String, required: true },
    module:         { 
      type: String 
      //enum:enums
    },
    endpoints:  [{
      url: { type: String }
    }],
    operation:      { type: String },
    date_created:   { type: Date },
    last_modified:  { type: Date }
});

// add mongoose-troop middleware to support pagination
PermissionSchema.plugin(paginator);

/**
 * Pre save middleware.
 *
 * @desc  - Sets the date_created and last_modified
 *          attributes prior to save.
 *        - Hash tokens password.
 */
PermissionSchema.pre('save', function preSaveMiddleware(next) {
  var instance = this;

  // set date modifications
  var now = moment().toISOString();

  instance.date_created = now;
  instance.last_modified = now;

  next();

});

/**
 * Filter Permission Attributes to expose
 */
PermissionSchema.statics.attributes = {
  name: 1,
  description: 1,
  module: 1,
  operation: 1,
  endpoints: 1,
  entity: 1,
  date_created: 1,
  last_modified: 1,
  _id: 1
};


// Expose Permission model
module.exports = mongoose.model('Permission', PermissionSchema);