/** *
 * Load Module Dependencies.
 */
var debug      = require('debug')('api:MFI-controller');
var async      = require('async');
var moment     = require('moment');
var _          = require('lodash');
var multer     = require ('multer');

var multiparty      = require ('multiparty');

var MFIDal          = require ('../dal/MFI');
var config          = require('../config');
var CustomError     = require('../lib/custom-error');
var enums           = require('../lib/enums');


exports.validateMFIId = function validateMFIId(req, res, next, id) {
  //Validate the id is mongoid or not
  req.checkParams('id', 'Invalid Id parameter').isMongoId(id);

  var validationErrors = req.validationErrors();

  if (validationErrors) {
    return next(new CustomError({
        status:400,                
        specific_errors:validationErrors                
    }));   

  }
  next(null);
}

exports.testMulti = function testMulti(req,res,next){
  form = new multiparty.Form();
  form.parse(req, function (err, fields, files){
       console.log(fields, files)
      })
      form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
      });

      form.on('part', function (part){
        if (part.filename){
          
          console.log('file:'+part.name)
          part.resume();
        }
        else
        console.log(part.name)
      })
      

      form.parse(req)
}
function validateLogoFileType(req, res, next, cb){
        var storage = multer.diskStorage({
            destination: config.STATIC_FILES + config.MFI_LOGO_PATH,

            //to override existing logo if any, use a specific file name
            filename: function (req, file, innerCb){            
              innerCb(null, 'logo.'+ file.originalname.split('.')[1])
          }
        })
        var upload = multer({
          storage: storage,  
          limits: {fileSize: config.MEDIA.FILE_SIZE},
          inMemory: true,      
          fileFilter: function (req, file, innerCb){                 
          //if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            if (file){
              if (!(file.mimetype.split('/')[0] === 'image')){         
                 return next(new CustomError({
                  status: 400,
                  specific_errors:[enums.APPL_ERROR_CODES.INVALID_LOGO_FILE]
                })
              )} 
            }                 
            
            innerCb(null, true);
          }
        }).single('logo');
        cb(null, upload, req, res, next)
}

function uploadLogo(upload, req, res, next, cb){
        upload(req, res, function (err){
          if (err){
            if (err.message === "Unexpected field")          
              return next(new CustomError({
                status:400,                
                specific_errors:[enums.APPL_ERROR_CODES.INVALID_LOGO_FIELD]                
              }));
            else if (err.message === "File too large")
              return next(new CustomError({
                status:400,                
                specific_errors:[enums.APPL_ERROR_CODES.TOO_BIG_LOGO_FILE]                
              }));
            else
              return next(new CustomError({
                status:500,
                specific_errors:[{code: 500, message: err.message}]
              }));
          }
          if (!req.file){
              return next(new CustomError({
                status:400,                            
                specific_errors: [enums.APPL_ERROR_CODES.NON_EXISTENT_LOGO]}))
                
          }         
          cb(null,req, next)
      })
}
function validateFieldData(req, next, cb){      
        req.checkBody ('name')
            .notEmpty().withMessage ('The name of the MFI can not be empty')
        req.checkBody ('location')
            .notEmpty().withMessage('The location of the MFI can not be empty')
        if (req.body.email){
          req.checkBody('email')
            .isEmail().withMessage('Email is invalid')
        }
        
        var validationErrors = req.validationErrors();
         if (validationErrors){            
            return next(new CustomError({
              status: 400,                             
              specific_errors: validationErrors
            }));            
          }
          else{
            cb(null)
          }
}
/**
 * Create a MFIDal.
 *
 * @desc create a MFI and add them to the database
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.create = function createMFI(req, res, next) {
  debug('create MFI');

  //workflow to create an MFI Organization
  //1. Check if an MFI exists (There should be only one record of the MFI)
  //2. Validate the logo file Type
  //3. Upload the logo
  //3. Create the MFI
  //4. If logo is provided, update the MFI document with the logo path.
  //5. Respond.
  

  async.waterfall([    
    function checkMFIExistence(cb){ 
      var query = {};      
      //better to check the count, instead of looking for a specific MFI 
      //as there could be only one MFI
      MFIDal.getCount(query, function (err, count){
        if (err){
          return next(new CustomError({
            status: 500,
            specific_errors:[{code: 500, message: err.message}]
          }));
        }

        if (count > 0){          
          return next(CustomError({
            status:422,            
            specific_errors: [enums.APPL_ERROR_CODES.MFI_EXIST_ERROR]            
          }))
        }
        else
          cb(null, req, res, next);
      })      
    }, validateLogoFileType        
     , uploadLogo
     , validateFieldData
     , function createMFI(cb){
        var MFIData = req.body;             
        MFIData.logo = req.file.path;

        MFIDal.create(MFIData, function (err, mfi){
          if (err){
            return next(new CustomError({
              status: 500,  
              specific_errors:[{code: 500, message: err.message}]        
            }));
          }
          else
            cb (null, mfi);
        })
    }], function completed (err, mfi){
        if (err){
          return next(new CustomError({                            
              status: 500,  
              specific_errors:[{code: 500, message: err.message}]
            }));
        }

        res.status = 201;
        res.json(mfi);
    })
} 
  
/**
 * Get a collection of MFIs
 *
 * @desc Fetch a collection of MFIs
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAll = function fetchAllMFIs(req, res, next) {
  debug('get a collection of MFIs');

  var query = {};
  var opts = {};

  MFIDal.getCollection(query, /*opts,*/ function cb(err, MFIs) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }
   
    res.json(MFIs);    
  });
};

/**
 * Get a collection of MFIs with pagination
 *
 * @desc Fetch a collection of MFIs
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function fetchAllMFIs(req, res, next) {
  debug('get a collection of MFIs');

  var page   = req.query.page || 1;
  var limit  = req.query.per_page || 10;

  var opts = {
    page: page,
    limit: limit,
    sort: { }
  };
  var query = {};
  

  MFIDal.getCollectionByPagination(query, opts, function cb(err, MFIs) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    res.json(MFIs);
  });
};


/**
 * Get a single MFI.
 *
 * @desc Fetch a MFI with the given id from the database.
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function fetchOneMFI(req, res, next) {
  debug('fetch MFI:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  MFIDal.get(query, function cb(err, mfi) {
    if(err) {      
      return next(CustomError({        
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    if (!mfi._id){
				return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.MFI_DOES_NOT_EXIST]	
      			}));
		}

    res.json(mfi);
  });
};

/**
 * Update a single MFI.
 *
 * @desc Fetch a MFI with the given id from the database
 *       and update their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.update = function updateMFI(req, res, next) {
  debug('updating MFI:'+ req.params.id);

  var query = {
    _id: req.params.id
  };
  var body = req.body;  

  async.waterfall([
    function validateLogoFileType(cb){
        var storage = multer.diskStorage({
            destination: config.STATIC_FILES + config.MFI_LOGO_PATH,

            //to override existing logo if any, use a specific file name
            filename: function (req, file, innerCb){            
              innerCb(null, 'logo.'+ file.originalname.split('.')[1])
          }
        })
        var upload = multer({
          storage: storage,  
          limits: {fileSize: config.MEDIA.FILE_SIZE},
          inMemory: true,      
          fileFilter: function (req, file, innerCb){                 
          //if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            if (file){
              if (!(file.mimetype.split('/')[0] === 'image')){         
                 return next(new CustomError({
                  status: 400,
                  specific_errors:[enums.APPL_ERROR_CODES.INVALID_LOGO_FILE]
                })
              )} 
            }                 
            
            innerCb(null, true);
          }
        }).single('logo');      
        cb(null,upload)      
  }, function uploadLogo(upload, cb){
        upload(req, res, function (err){
            if (err){
              if (err.message === "Unexpected field")          
                return next(new CustomError({
                  status:400,                
                  specific_errors:[enums.APPL_ERROR_CODES.INVALID_LOGO_FIELD]                
                }));
              else if (err.message === "File too large")
                return next(new CustomError({
                  status:400,                
                  specific_errors:[enums.APPL_ERROR_CODES.TOO_BIG_LOGO_FILE]                
                }));
              else
                return next(new CustomError({
                  status:500,
                  specific_errors:[{code: 500, message: err.message}]
                }));
            }

            if (req.body.logo && !req.file ){
              return next(new CustomError({
                status:400,                            
                specific_errors: [enums.APPL_ERROR_CODES.NON_EXISTENT_LOGO]}))
                
          }  
            
            cb(null) 
          })                       
        
    }, function validateFieldData(cb){     
        if (req.body.email){
          req.checkBody('email')
            .isEmail().withMessage('Email is invalid')
        }
        
        var validationErrors = req.validationErrors();
         if (validationErrors){            
            return next(new CustomError({
              status: 400,                             
              specific_errors: validationErrors
            }));            
          }
          else{
            cb(null)
          }
}, function updateMFI(cb){
      var updates = req.body;
      if(req.file)             
        updates.logo = req.file.path;

      MFIDal.update(query, updates, function (err, mfi) {
        if(err) {  
          return next(CustomError({
        			status: 500,					
        			specific_errors:[{code: 500, message: err.message}]
				  }));
        }

        if (!mfi._id){
				  return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.MFI_DOES_NOT_EXIST]	
      		}));
		    }
        else 
          cb(null, mfi);

      
    })
  }],function completed (err, mfi){
      if (err){
        return next(new CustomError({                            
            status: 500,  
            specific_errors:[{code: 500, message: err.message}]
          }));
      }

      res.status = 200;
      res.json(mfi);
    })

  

  };



/**
 * Delete/Archive a single MFI.
 *
 * @desc Fetch a MFI with the given id from the database
 *       and delete their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.delete = function deleteMFI(req, res, next) {
  debug('deleting MFI:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  MFIDal.delete(query, function cb(err, mfi) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    if (!mfi._id){
				return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.MFI_DOES_NOT_EXIST]	
      			}));
		}

    res.json(mfi);

  });

};





