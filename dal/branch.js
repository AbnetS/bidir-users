////////   BRANCH DATA ACCESS LAYER   /////////////////

//Load Module Dependencies
var mongoose  = require ('mongoose');
var debug     = require ('debug') ('Bidir-api-branch-dal')
var moment    = require ('moment');

var branchModel 	= require ('../models/branch');
var enums		      = require ('../lib/enums');
var CustomError   = require('../lib/custom-error');


var returnFields = branchModel.whitelist;
var population	 = [];

//A method to create a branch document in Branches collection of the Bidir DB
//cb is supposed to have two arguments: err, savedBranch
exports.create = function createBranch (branchData, cb){
	debug ('Creating a branch');

	//Step 1 - create the branch instance/document/ that is to be saved to the database
	var branch = new branchModel (branchData);

	//Step 2 - Call the save method of the mongoose model to add the instance to the 'Branches' collection
	branch.save (function afterSave (err, savedBranch){
		if (err){
			return cb (err);
		};

		return cb (null, savedBranch);

	});
};

//A method to get a single branch based on query
exports.get = function getBranch (query, cb){
	debug ('Getting a branch');

	branchModel
		.findOne(query, returnFields)
		.populate (population)
		.select (returnFields)	
		.exec (function afterSearch (err, searchedBranch){
				if (err){
					return cb (err);
				}				

				cb (null, searchedBranch  || {});
			});
}

exports.getCollection = function getBranches (query, cb){
	debug ('getting branchs');

	branchModel
		.find(query)
		.populate (population)
		.select (returnFields)		
		.exec (function afterSearch (err, searchedBranches){
				if (err){
					return cb (err);
				}

				cb (null, searchedBranches  || {});
			});
};

exports.getCollectionByPagination = function getCollection(query, qs, cb) {
  debug('fetching a collection of Branches');

  var opts = {
    columns:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    Number(qs.limit)
  };
  
  branchModel.paginate(query, opts, function (err, docs, page, count) {
    if(err) {
      return cb(err);
    }


    var data = {
      total_pages: page,
      total_docs_count: count,
      docs: docs
    };

    cb(null, data);

  });

};


exports.update = function updateBranch (query, update, cb){
	debug ('Updating Branch: ', query);

	branchModel
		.findOneAndUpdate (query, update, {new:true})
		.select (returnFields)
		.exec (function updateBranch (err,branch){
			if (err){
				return cb (err)
			}			

			cb (null, branch || {});
		});
}

exports.delete = function deleteBranch (query, cb){
 	debug ('Deleting Branch: ', query);

	 branchModel
        .findOne(query)
        .select (returnFields)
        .exec(function afterSearch (err, searchedBranch){
            if (err){
              return cb (err);				
            }
            if (!searchedBranch){
                return cb (null, {});
            }
            else{
                searchedBranch.remove(function afterRemove(err){
                    if (err){
                        return cb (err);
                    }
                    return cb(null,searchedBranch);
                }) 
            }
			
			
	 });
};


exports.deleteAll = function deleteAllBranches (cb){
	debug ('Deleting All Branches: ');

	branchModel.remove ({}, function afterRemove(err){
		if (err){
			return cb (err);
		}		
		return cb (null);

	})
}

exports.getCount = function getBranchesCount (query, cb){
	debug ('counting and returning the total number of Branches....');

	branchModel.count (query, function (err, count){
		if (err){
			return cb (err);
		}

		cb (null, count);

	})
} 

