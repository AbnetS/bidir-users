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
 * Update Account Status
 *
 * @desc Fetch a account with the given ID and update their respective status.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updateStatus = function* updateAccount(next) {
  debug(`updating status account: ${this.params.id}`);

  this.checkBody('is_active')
      .notEmpty('is_active should not be empty');

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let account = yield AccountDal.update(query, body);

    yield LogDal.track({
      event: 'account_status_update',
      account: this.state._user._id ,
      message: `Update Status for ${account.email}`,
      diff: body
    });

    this.body = account;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'ACCOUNT_STATUS_UPDATE_ERROR',
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

  let isPermitted = yield checkPermissions({ user: this.state._user._id }, 'UPDATE');
  if(!isPermitted) {
    return this.throw(new CustomError({
      type: 'USER_UPDATE_ERROR',
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

    if(account.user.status === 'pending') {
      account = yield AccountDal.update(query, body);

    } else {
      account = yield AccountDal.update(query, body);
      
      yield UserDal.update({ _id: account.user._id }, { status: 'pending' });


      // Create Task
      yield TaskDal.create({
        task: `Approve Updated Account of ${account.first_name} ${account.last_name}`,
        task_type: 'approve',
        entity_ref: account._id,
        entity_type: 'account',
        created_by: this.state._user._id
      })


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

  // retrieve pagination query params
  let page   = this.query.page || 1;
  let limit  = this.query.per_page || 10;
  let query = {
    archived: false
  };

  let sortType = this.query.sort_by;
  let sort = {};
  sortType ? (sort[sortType] = 1) : null;

  let opts = {
    page: +page,
    limit: +limit,
    sort: sort
  };

  try {
    let accounts = yield AccountDal.getCollectionByPagination(query, opts);

    this.body = accounts;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'FETCH_PAGINATED_ACCOUNTS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};

/**
 * Get a branch users
 *
 * @desc Fetch a users of a given branch or access to branches
 *
 * @param {Function} next Middleware dispatcher
 */
exports.getBranchAccounts = function* getBranchAccounts(next) {
  debug('get branch users');

  // retrieve pagination query params
  let page   = this.query.page || 1;
  let limit  = this.query.per_page || 10;

  let sortType = this.query.sort_by;
  let sort = {};
  sortType ? (sort[sortType] = 1) : null;

  let opts = {
    page: +page,
    limit: +limit,
    sort: sort
  };

  try {
    let query;
    let user = this.state._user._id;
    let account = yield Account.findOne({ user: user }).exec();
    
    if(this.query.branch) {
      query = {
        $or: [{
          access_branches: this.query.branch,
          default_branch:  this.query.branch
        }]
      }
    } else {
      query = { $or: [{}] }
      if(account.access_branches.length) {
        query.$or[0].access_branches = { $in: account.access_branches };
      }

      if(account.default_branch) {
        query.$or[0].default_branch = account.default_branch;
      }
    }

    let accounts = yield AccountDal.getCollectionByPagination(query, opts);

    this.body = accounts;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'BRANCH_ACCOUNTS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};