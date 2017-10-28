// Permission Model Definiton.

/**
 * Load Module Dependencies.
 */
var mongoose  = require('mongoose');
var moment    = require('moment');
var paginator = require('mongoose-paginate');

var Schema = mongoose.Schema;

var PermissionSchema = new Schema({       
    name:           { type: String, required: true },
    description:    { type: String },  
    endpoints:      [{ type: Schema.Types.ObjectId, ref:'Permission'}],  
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
PermissionSchema.statics.whitelist = {
  __v: 0
};


// Expose Permission model
module.exports = mongoose.model('Permission', PermissionSchema);
