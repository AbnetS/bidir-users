'use strict';
/**
 * Load Module Dependencies.
 */
const crypto  = require('crypto');
const path    = require('path');
const url     = require('url');

const debug      = require('debug')('api:permission-controller');
const moment     = require('moment');
const jsonStream = require('streaming-json-stringify');
const _          = require('lodash');
const co         = require('co');
const del        = require('del');
const validator  = require('validator');

const config             = require('../config');
const CustomError        = require('../lib/custom-error');

const LogDal             = require('../dal/log');
const PermissionDal      = require('../dal/permission');


/**
 * Create a permission.
 *
 * @desc create a permission using basic Authentication or Social Media
 *
 * @param {Function} next Middleware dispatcher
 *
 */
exports.create = function* createPermission(next) {
  debug('create permission');

  let body = this.request.body;

  this.checkBody('name')
      .notEmpty('Permission name is empty');
  this.checkBody('entity')
      .notEmpty('Permission Entity is empty');
   this.checkBody('operation')
      .notEmpty('Permission operation is empty')
      .isIn(['VIEW', 'CREATE', 'UPDATE', 'ARCHIVE', 'AUTHORIZE'], 'Permission Operations are VIEW, CREATE, UPDATE, ARCHIVE and AUTHORIZE');

  if(this.errors) {
    return this.throw(new CustomError({
      type: 'PERMISSION_CREATION_ERROR',
      message: JSON.stringify(this.errors)
    }));
  }

  try {

    let permission = yield PermissionDal.get({ name: body.name });

    if(permission) {
      throw new Error('A Permission with name already exists');
    }

    permission = yield PermissionDal.create(body);

    this.status = 201;
    this.body = permission;

  } catch(ex) {
    this.throw(new CustomError({
      type: 'PERMISSION_CREATION_ERROR',
      message: ex.message
    }));
  }


};


/**
 * Get a single permission.
 *
 * @desc Fetch a permission with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOnePermission(next) {
  debug(`fetch permission: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let permission = yield PermissionDal.get(query);

    yield LogDal.track({
      event: 'view_permission',
      permission: this.state._user._id ,
      message: `View permission - ${permission.email}`
    });

    this.body = permission;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'PERMISSION_RETRIEVAL_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Update Permission Status
 *
 * @desc Fetch a permission with the given ID and update their respective status.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updateStatus = function* updatePermission(next) {
  debug(`updating status permission: ${this.params.id}`);

  this.checkBody('is_active')
      .notEmpty('is_active should not be empty');

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let permission = yield PermissionDal.update(query, body);

    yield LogDal.track({
      event: 'permission_status_update',
      permission: this.state._user._id ,
      message: `Update Status for ${permission.email}`,
      diff: body
    });

    this.body = permission;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'PERMISSION_STATUS_UPDATE_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Update a single permission.
 *
 * @desc Fetch a permission with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updatePermission(next) {
  debug(`updating permission: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let permission = yield PermissionDal.update(query, body);

    yield LogDal.track({
      event: 'permission_update',
      permission: this.state._user._id ,
      message: `Update Info for ${permission.email}`,
      diff: body
    });

    this.body = permission;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_PERMISSION_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Get a collection of permissions by Pagination
 *
 * @desc Fetch a collection of permissions
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllPermissions(next) {
  debug('get a collection of permissions by pagination');

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
    let permissions = yield PermissionDal.getCollectionByPagination(query, opts);

    this.body = permissions;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'FETCH_PAGINATED_PERMISSIONS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};

/**
 * Get a collection of permissions grouped by Module
 *
 * @desc Fetch a collection of permissions grouped by module
 *
 * @param {Function} next Middleware dispatcher
 */
exports.getByModules = function* getByModules(next) {
  debug('get a collection of permissions by modules');

  try {
    let query = {};
    
    let permissions = yield PermissionDal.getCollection(query);

    let groups = {};

    for(let permission of permissions) {
      groups[permission.module] = groups[permission.module] || [];

      groups[permission.module].push(permission);
    }

    this.body = groups;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'GROUPED_PERMISSIONS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};


/**
 * Remove a single permission.
 *
 * @desc Fetch a permission with the given id from the database
 *       and Remove their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.remove = function* removePermission(next) {
  debug(`removing permission: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let permission = yield PermissionDal.delete(query);
    if(!permission) {
      throw new Error('Permission Does Not Exist!');
    }

    yield LogDal.track({
      event: 'permission_delete',
      permission: this.state._user._id ,
      message: `Delete Info for ${permission._id}`
    });

    this.body = permission;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'REMOVE_PERMISSION_ERROR',
      message: ex.message
    }));

  }

};