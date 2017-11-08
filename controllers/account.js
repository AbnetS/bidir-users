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

const TokenDal           = require('../dal/token');
const AccountDal         = require('../dal/account');
const UserDal            = require('../dal/user');
const LogDal             = require('../dal/log');
const BranchDal          = require('../dal/branch');
const RoleDal           = require('../dal/role');
const PermissionDal      = require('../dal/permission');

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

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let account = yield AccountDal.update(query, body);

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
  let query = {};

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


//--UTILITIES--//

/**
 * Bootstrap Account based to signup type
 */
function boostrapAccount(body) {
  return co(function* () {
    // Create Account Type
    let user = yield UserDal.create({
      username: body.email,
      password: body.password,
      role: body.role,
      realm: body.realm
    });

    // Create Account Type
    let account = yield AccountDal.create({
      user: user._id,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      role: body.role,
      permissions: body.permissions,
      branch: body.branch
    });

    // Update Account with Player
    user = yield UserDal.update({ _id: user._id }, { account: account._id });
    return account;

  });
}

