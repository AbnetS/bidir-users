var debug      = require('debug')('api:Branch-controller');
var async      = require('async');
var moment     = require('moment');
var _          = require('lodash');

var branchModel       = require ('../models/branch');
var branchDal       = require ('../dal/branch');
var MFIDal          = require ('../dal/MFI');
var config          = require('../config');
var CustomError     = require('../lib/custom-error');
var enums           = require('../lib/enums');

exports.validateBranchId = function validateBranchId(req, res, next, id) {
  //Validate the id is`x mongoid or not
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

exports.create = function createBranch(req, res, next){
  //Worklow to create a branch
  //1. Validate data
  //2. Get the MFI since there is only one MFI
  //3. Check in case the branch exists
  //4. Create the branch record under the MFI in (2)
  //5. Add the branch to MFI branches array
          //4. Create task for an approver admin (for all)
  //6. Respond
  
  async.waterfall([
    function getMFI(cb){      
      MFIDal.getCollection({ }, function (err, mfi){
        if (err){
          return next(new CustomError({
            status: 500,
            specific_errors:[{code: 500, message: err.message}]
          }));
        }

        if (mfi.length === 0){
          return next(new CustomError({
            status: 400,
            specific_errors: [enums.APPL_ERROR_CODES.MFI_NOT_REGISTERED]
          }))
        }

        cb(null, mfi[0])
      })
    }, function validateData(mfi, cb){
      req.checkBody({
        name:{notEmpty: true, errorMessage:'Branch name can not be empty!'},
        location:{notEmpty: true, errorMessage:'Branch location can not be empty!'}        
      })

      if (req.body.email){
        req.checkBody({email:{isEmail:true, errorMessage:"Email is invalid"}})
      }
      var validationErrors = req.validationErrors();

      if (validationErrors) {
          return next(new CustomError({
              status:400,                
              specific_errors:validationErrors                
        }));  
      }

      cb(null, mfi)
    }, function checkIfBranchExists(mfi, cb){     
      branchDal.get({name: req.body.name.trim()}, function (err, branch){
        if (err){
          return next(new CustomError({
            status: 500,
            specific_errors:[{code: 500, message: err.message}]
          }));
        }

        if (branch._id){
          return next (new CustomError({
            status: 400,
            specific_errors:enums.APPL_ERROR_CODES.BRANCH_NAME_EXISTS 
          }))
        }

        cb (null, mfi);
      })
    }, function createBranch(mfi, cb){
      var branchData = req.body;
      branchData.name = req.body.name.trim();
      branchData.MFI = mfi._id

      branchDal.create(branchData, function (err, branch){
        if (err){
          console.log(err)
          return next (new CustomError ({
            status: 500,
            specific_errors:[{code: 500, message: err.message}]
            //specific_errors: [err.toJSON()]
          }))
        }

        cb(null, mfi, branch)
      })
    }, function addBranchesToMFI(mfi, branch, cb){
      var updates = {$push:{branches: branch._id}}

      MFIDal.update({_id: mfi._id}, updates, function (err, mfi){
        if (err){
          return next(new CustomError({
            status: 500,
            specific_errors:[{code: 500, message: err.message}]
          }));
        }

        cb(null, branch)
      })
    }], function completed (err, branch){
          if (err){
            return next(new CustomError({                            
                status: 500,  
                specific_errors:[{code: 500, message: err.message}]
              }));
          }

          res.status = 201;
          res.json(branch);
      }
)}

/**
 * Get a collection of Branches
 *
 * @desc Fetch a collection of Branches
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAll = function fetchAllBranches(req, res, next) {
  debug('get a collection of Branches');

  var query = {};
  var opts = {};

  branchDal.getCollection(query, /*opts,*/ function cb(err, Branches) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }
   
    res.json(Branches);    
  });
};

/**
 * Get a collection of Branches with pagination
 *
 * @desc Fetch a collection of Branches
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function fetchAllBranches(req, res, next) {
  debug('get a collection of Branches');

  var page   = req.query.page || 1;
  var limit  = req.query.per_page || 10;

  var opts = {
    page: page,
    limit: limit,
    sort: { }
  };
  var query = {};
  

  branchDal.getCollectionByPagination(query, opts, function cb(err, Branches) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    res.json(Branches);
  });
};


/**
 * Get a single Branch.
 *
 * @desc Fetch a Branch with the given id from the database.
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function fetchOneBranch(req, res, next) {
  debug('fetch Branch:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  branchDal.get(query, function cb(err, branch) {
    if(err) {      
      return next(CustomError({        
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    if (!branch._id){
				return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.BRANCH_DOES_NOT_EXIST]	
      			}));
		}

    res.json(branch);
  });
}; 

/**
 * Update a single Branch.
 *
 * @desc Fetch a Branch with the given id from the database
 *       and update their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.update = function updateBranch(req, res, next) {
  debug('updating Branch:'+ req.params.id);

  var query = {
    _id: req.params.id
  };
  var body = req.body;
  console.log(req.body)

  async.waterfall([
    function checkIfNameIsUnique(cb){
      branchDal.get({name: req.body.name.trim()}, function (err, branch){
        if (err){
          return next(new CustomError({
            status: 500,
            specific_errors:[{code: 500, message: err.message}]
          }));
        }

        if (branch._id && branch._id != req.params.id){
          return next (new CustomError({
            status: 400,
            specific_errors:enums.APPL_ERROR_CODES.BRANCH_NAME_EXISTS 
          }))
        }

        cb (null);
      })    
  }, function validateFields(cb){
      if(req.body.email){
        req.checkBody({        
          email:{isEmail:true, errorMessage:"Email is invalid"}
        });
        var validationErrors = req.validationErrors();

        if (validationErrors) {
            return next(new CustomError({
                status:400,                
                specific_errors:validationErrors                
          }));  
        }
      }

      cb(null);
  }, function updateBranch(cb){
      var query = {_id: req.params.id}
      var updates = req.body;      

      branchDal.update(query, updates, function (err, branch) {
        if(err) {  
          return next(CustomError({
        			status: 500,					
        			specific_errors:[{code: 500, message: err.message}]
				  }));
        }

        if (!branch._id){
				  return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.BRANCH_DOES_NOT_EXIST]	
      		}));
		    }
        else 
          cb(null, branch);      
    })
  }],function completed (err, branch){
      if (err){
        return next(new CustomError({                            
            status: 500,  
            specific_errors:[{code: 500, message: err.message}]
          }));
      }

      res.status = 200;
      res.json(branch);
    }) 

  };



/**
 * Delete/Archive a single Branch.
 *
 * @desc Fetch a Branch with the given id from the database
 *       and delete their data
 *
 * @param {Object} req HTTP Request Object
 * @param {Object} res HTTP Response Object
 * @param {Function} next Middleware dispatcher
 */
exports.delete = function deleteBranch(req, res, next) {
  debug('deleting Branch:' + req.params.id);

  var query = {
    _id: req.params.id
  };

  branchDal.delete(query, function cb(err, branch) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    if (!branch._id){
				return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.BRANCH_DOES_NOT_EXIST]	
      			}));
		}

    res.json(branch);

  });

};

exports.activate = function activateBranch(req, res, next) {
  debug('deactivatiing Branch:' + req.params.id);

  var query = {
    _id: req.params.id
  };
  var updates = {status: 'active'}

  branchDal.update(query, updates, function cb(err, branch) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    if (!branch._id){
				return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.BRANCH_DOES_NOT_EXIST]	
      			}));
		}

    res.json(branch);

  });

};

exports.deactivate = function deactivateBranch(req, res, next) {
  debug('deactivatiing Branch:' + req.params.id);

  var query = {
    _id: req.params.id
  };
  var updates = {status: 'inactive'}

  branchDal.update(query, updates, function cb(err, branch) {
    if(err) {
      return next(CustomError({
        status: 500,
        specific_errors:[{code: 500, message: err.message}]
      }));
    }

    if (!branch._id){
				return next (new CustomError({
        			status: 400,
        			specific_errors: [enums.APPL_ERROR_CODES.BRANCH_DOES_NOT_EXIST]	
      			}));
		}

    res.json(branch);

  });

};

exports.search = function searchBranch(req, res, next){
  //check if all paramters are valid
  var query = {};
  var param_not_found = [];

  if (Object.keys(req.query).length === 0){
    return next(new CustomError({
      status: 400,
      specific_errors:[enums.APPL_ERROR_CODES.SEARCH_PARAM_NOT_GIVEN]
    }))
  } 


  for (param in req.query){
    //exclude MFI and opening_date, though it is a valid key in branch schema, search is not applicable  
    if (param === 'MFI') param_not_found.push(param); 
    else if (param === 'opening_date') param_not_found.push(param);
    //exclude non exisitng branch attributes
    else if (!(Object.keys(branchModel.schema.paths).includes(param)))
      param_not_found.push(param);
    else
      query[param] = {$regex: req.query[param], $options:"$i"} 
         
  }

  if (param_not_found.length > 0){
    var error = enums.APPL_ERROR_CODES.INVALID_SEARCH_PARAM;    
    error.source = param_not_found.toString();
    return next (new CustomError({
      status: 400,
      specific_errors:[error]
    }))
  }
  
  branchDal.getCollection (query, function (err, branches){
    if (err){
      return next (new CustomError ({
        status: 500,
        specific_errors: [{code: 500, message: err.message}]
      }))
    }
  

    if (branches.length == 0){
      res.status = 200.
      res.json({
        message: 'No branches that match the given condition(s) can be found'
      })
    }
    else{
      res.status = 200.
      res.json({
        message: 'Branch(es) are found',
        branches: branches
      })
    }
  })
  
}




