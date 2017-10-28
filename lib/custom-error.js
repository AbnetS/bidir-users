//A Custom error constructor

/**
 * Load Module Dependencies
 */
var httpStatus = require ('http-status');

/**
 * CustomError Type Definition.
 *
 * @param {Object} info error information
 *
 */
function CustomError(info) {
  if(!(this instanceof CustomError)) {
    return new CustomError(info);
  }  
  
  this.specific_errors = [];
  this.status  = info.status ? info.status : 400;
  this.message    = httpStatus[this.status];   
  this.specific_errors = info.specific_errors;

  //to create a uniform interface, replace the mongoose-validator parameters
  if (this.specific_errors){ 
    //to interprete the express-validator error response to BIDIR API error response format
    for (i = 0;i<this.specific_errors.length; i++){
      if (this.specific_errors[i].msg){
        this.specific_errors[i].message = this.specific_errors[i]['msg'];
        delete this.specific_errors[i].msg;
      }
      if (this.specific_errors[i].param){
        this.specific_errors[i].source = this.specific_errors[i]['param'];
        delete this.specific_errors[i].param;
      }      
    }

    //to interprete the mongoose validaton error response to BIDIR API error response format
    for (i = 0;i<this.specific_errors.length; i++){
      if (this.specific_errors[i].code && this.specific_errors[i].code === 11000){        
        var source = this.specific_errors[i].errmsg.split(':')[2].split('_')[0].trim();        
        delete this.specific_errors[i].message;
        delete this.specific_errors[i].errmsg;
        delete this.specific_errors[i].code;
        delete this.specific_errors[i].index;
        delete this.specific_errors[i].op;

        this.specific_errors[i].message = 'Duplicate value is not allowed for '+ source;
        this.specific_errors[i].source = source;        
      }          
    }
  }


}

CustomError.prototype = Object.create(Error.prototype);

CustomError.prototype.constructor = CustomError;

function convertMongooseValidErrs(errors){

}

// Expose Constructor
module.exports = CustomError;
