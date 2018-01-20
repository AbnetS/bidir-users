'use strict';
/**
 * Load Module Dependencies.
 */
const crypto  = require('crypto');
const path    = require('path');
const url     = require('url');

const debug      = require('debug')('api:account-controller');
const moment     = require('moment');
const jsonStream = require('streaming-json-stringify');
const _          = require('lodash');
const co         = require('co');
const del        = require('del');
const validator  = require('validator');

const config             = require('../config');
const CustomError        = require('../lib/custom-error');
const googleBuckets      = require('../lib/google-buckets');
const checkPermissions   = require('../lib/permissions');

const Account            = require('../models/account');

const TokenDal           = require('../dal/token');
const AccountDal         = require('../dal/account');
const UserDal            = require('../dal/user');
const LogDal             = require('../dal/log');
const BranchDal          = require('../dal/branch');
const RoleDal           = require('../dal/role');
const PermissionDal      = require('../dal/permission');
const TaskDal            = require('../dal/task');

let hasPermission = checkPermissions.isPermitted('USER');

/**
 * Get a single account.
 *
 * @desc Fetch a account with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneAccount(next) {
  debug(`fetch account: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let account = yield AccountDal.get(query);
    if(!account) {
      throw new Error('Account Does Not Exist!!')
    }

    account = account.toJSON();

    if(account.multi_branches) {
      let branches  = yield BranchDal.getCollection({});

      account.access_branches = branches.slice();

    }

    yield LogDal.track({
      event: 'view_account',
      account: this.state._user._id ,
      message: `View account - ${account.email}`
    });

    this.body = account;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'ACCOUNT_RETRIEVAL_ERROR',
      message: ex.message
    }));
  }

};


/**
 * Update a single account.
 *
 * @desc Fetch a account with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateAccount(next) {
  debug(`updating account: ${this.params.id}`);

  let isPermitted = yield hasPermission(this.state._user, 'UPDATE');
  if(!isPermitted) {
    return this.throw(new CustomError({
      type: 'ACCOUNT_UPDATE_ERROR',
      message: "You Don't have enough permissions to complete this action"
    }));
  }

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let account = yield AccountDal.get(query);
    if(!account) {
      throw new Error('Account Does Not Exist');
    }

    account = account.toJSON();

    if(body.access_branches) {

      let accessBranches = [];

      for(let branch of body.access_branches) {
        let brnch = yield BranchDal.get({ _id: branch });
        // add only existing and active branches
        if(brnch && brnch.status == 'active') {
          accessBranches.push(branch.toString());
        }
      }

      //body.access_branches = _.uniq(_.concat(accessBranches, originalList))
      body.access_branches = accessBranches;

    } else if(body.default_branch) {
      let brnch = yield BranchDal.get({ _id: body.default_branch });

      // skip non existing branches and inactive branches
      if(!brnch || brnch.status == 'inactive' || (account.default_branch._id.toString() == brnch._id)) {
        delete body.default_branch;
      }
    }

    account = yield AccountDal.update(query, body);

    account = account.toJSON();

    if(account.multi_branches) {
      let branches  = yield BranchDal.getCollection({});

      account.access_branches = branches.slice();

    }

    yield LogDal.track({
      event: 'account_update',
      account: this.state._user._id ,
      message: `Update Info for ${account.email}`,
      diff: body
    });

    this.body = account;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_ACCOUNT_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Update Account photo
 *
 * @desc Fetch a account with the given id from the database
 *       and update their Photo
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updatePhoto = function* updateAccountPhoto(next) {
  debug(`updating photo for account: ${this.params.id}`);

  let isPermitted = yield hasPermission(this.state._user, 'UPDATE');
  if(!isPermitted) {
    return this.throw(new CustomError({
      type: 'UPDATE_ACCOUNT_PHOTO_ERROR',
      message: "You Don't have enough permissions to complete this action"
    }));
  }

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;
  let bodyKeys = Object.keys(body);
  let isMultipart = (bodyKeys.indexOf('fields') !== -1) && (bodyKeys.indexOf('files') !== -1);

  // If content is multipart reduce fields and files path
  if(isMultipart) {
    let _clone = {};

    for(let key of bodyKeys) {
      let props = body[key];
      let propsKeys = Object.keys(props);

      for(let prop of propsKeys) {
        _clone[prop] = props[prop];
      }
    }

    body = _clone;

  }

  let errors = [];

  if(errors.length) {
    return this.throw(new CustomError({
      type: 'UPDATE_ACCOUNT_PHOTO_ERROR',
      message: JSON.stringify(errors)
    }));
  }

  try {
    
    if(body.picture) {
      let filename  = body.first_name.trim().toUpperCase().split(/\s+/).join('_');
      let id        = crypto.randomBytes(6).toString('hex');
      let extname   = path.extname(body.picture.name);
      let assetName = `${filename}_${id}${extname}`;

      let url       = yield googleBuckets(body.picture.path, assetName);

      body.picture = url;
    }
    let account = yield AccountDal.update(query, body);

    yield LogDal.track({
      event: 'account_photo_update',
      user: this.state._user._id ,
      message: `Update Photo for ${account.email}`,
      diff: body
    });

    this.body = account;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_ACCOUNT_PHOTO_ERROR',
      message: ex.message
    }));

  }

};


/**
 * Get a collection of accounts by Pagination
 *
 * @desc Fetch a collection of accounts
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllAccounts(next) {
  debug('get a collection of accounts by pagination');

  let isPermitted = yield hasPermission(this.state._user, 'VIEW');
  if(!isPermitted) {
    return this.throw(new CustomError({
      type: 'VIEW_ACCOUNTS_COLLECTION_ERROR',
      message: "You Don't have enough permissions to complete this action"
    }));
  }

  // retrieve pagination query params
  let page   = this.query.page || 1;
  let limit  = this.query.per_page || 10;
  let query = {
    archived: false
  };

  let sortType = this.query.sort_by;
  let sort = {};
  sortType ? (sort[sortType] = -1) : (sort.date_created = -1 );

  let opts = {
    page: +page,
    limit: +limit,
    sort: sort
  };

  try {
    let user = this.state._user;
    let account = yield Account.findOne({ user: user._id }).exec();
    
    if(account) {
      if(!account.multi_branches) {
        if(account.access_branches.length) {
          query.access_branches = { $in: account.access_branches };

        } else if(account.default_branch) {
          query.default_branch = account.default_branch;

        }
      }
    }

    let accounts = yield AccountDal.getCollectionByPagination(query, opts);

    this.body = accounts;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'VIEW_ACCOUNTS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};

/**
 * Search accounts
 *
 * @desc Fetch a collection of accounts
 *
 * @param {Function} next Middleware dispatcher
 */
exports.search = function* searchAccounts(next) {
  debug('search accounts');

  let isPermitted = yield hasPermission(this.state._user, 'VIEW');
  if(!isPermitted) {
      return this.throw(new CustomError({
        type: 'SEARCH_ACCOUNTS_ERROR',
        message: "You Don't have enough permissions to complete this action"
      }));
  }

  // retrieve pagination query params
  let page   = this.query.page || 1;
  let limit  = this.query.per_page || 10;
  let query = {};

  let sortType = this.query.sort_by;
  let sort = {};
  sortType ? (sort[sortType] = -1) : (sort.date_created = -1 );

  let opts = {
    page: +page,
    limit: +limit,
    sort: sort
  };

  try {
    let user = this.state._user;
    let account = yield Account.findOne({ user: user._id }).exec();

     if(account) {
        if(!account.multi_branches) {
          if(account.access_branches.length) {
            query.access_branches = { $in: account.access_branches };

          } else if(account.default_branch) {
            query.default_branch = account.default_branch;

          }
        }
      }

    let searchTerm = this.query.search;
    if(!searchTerm) {
      throw new Error('Please Provide A Search Term');
    }

    query.$or = [];

    let terms = searchTerm.split(/\s+/);
    let groupTerms = { $in: [] };

    for(let term of terms) {
      if(validator.isMongoId(term)) {
        throw new Error('IDs are not supported for Search');
      }

      term = new RegExp(`${term}`, 'i')

      groupTerms.$in.push(term);
    }

    query.$or = [{
        title: groupTerms
      },{
        gender: groupTerms
      },{
        first_name: groupTerms
      },{
        last_name: groupTerms
      },{
        phone: groupTerms
      },{
        email: groupTerms
      },{
        grandfather_name: groupTerms
      }];

    
    let accounts = yield AccountDal.getCollectionByPagination(query, opts);

    this.body = accounts;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'SEARCH_ACCOUNTS_ERROR',
      message: ex.message
    }));
  }
};