'use strict';
/**
 * Load Module Dependencies.
 */
const crypto  = require('crypto');
const path    = require('path');
const url     = require('url');

const debug      = require('debug')('api:role-controller');
const moment     = require('moment');
const jsonStream = require('streaming-json-stringify');
const _          = require('lodash');
const co         = require('co');
const del        = require('del');
const validator  = require('validator');

const config             = require('../config');
const CustomError        = require('../lib/custom-error');

const LogDal             = require('../dal/log');
const RoleDal            = require('../dal/role');


/**
 * Create a role.
 *
 * @desc create a role using basic Authentication or Social Media
 *
 * @param {Function} next Middleware dispatcher
 *
 */
exports.create = function* createRole(next) {
  debug('create role');

  let body = this.request.body;

  if(this.errors) {
    return this.throw(new CustomError({
      type: 'ROLE_CREATION_ERROR',
      message: JSON.stringify(this.errors)
    }));
  }

  try {

    let role = yield RoleDal.get({ name: body.name });

    if(role) {
      throw new Error('A Role with name already exists');
    }

    role = yield RoleDal.create(body);

    this.status = 201;
    this.body = role;

  } catch(ex) {
    this.throw(new CustomError({
      type: 'ROLE_CREATION_ERROR',
      message: ex.message
    }));
  }


};


/**
 * Get a single role.
 *
 * @desc Fetch a role with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneRole(next) {
  debug(`fetch role: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let role = yield RoleDal.get(query);

    yield LogDal.track({
      event: 'view_role',
      role: this.state._user._id ,
      message: `View role - ${role.email}`
    });

    this.body = role;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'ROLE_RETRIEVAL_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Update Role Status
 *
 * @desc Fetch a role with the given ID and update their respective status.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updateStatus = function* updateRole(next) {
  debug(`updating status role: ${this.params.id}`);

  this.checkBody('is_active')
      .notEmpty('is_active should not be empty');

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let role = yield RoleDal.update(query, body);

    yield LogDal.track({
      event: 'role_status_update',
      role: this.state._user._id ,
      message: `Update Status for ${role.email}`,
      diff: body
    });

    this.body = role;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'ROLE_STATUS_UPDATE_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Update a single role.
 *
 * @desc Fetch a role with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateRole(next) {
  debug(`updating role: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let role = yield RoleDal.update(query, body);

    yield LogDal.track({
      event: 'role_update',
      role: this.state._user._id ,
      message: `Update Info for ${role.email}`,
      diff: body
    });

    this.body = role;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_ROLE_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Get a collection of roles by Pagination
 *
 * @desc Fetch a collection of roles
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllRoles(next) {
  debug('get a collection of roles by pagination');

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
    let roles = yield RoleDal.getCollectionByPagination(query, opts);

    this.body = roles;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'FETCH_PAGINATED_ROLES_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};
