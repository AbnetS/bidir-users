'use strict';
/**
 * Load Module Dependencies.
 */
const crypto  = require('crypto');
const path    = require('path');
const url     = require('url');

const debug      = require('debug')('api:user-controller');
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

const UserDal            = require('../dal/user');
const LogDal             = require('../dal/log');
const BranchDal          = require('../dal/branch');
const RoleDal           = require('../dal/role');
const PermissionDal      = require('../dal/permission');
const AccountDal        = require('../dal/account');
const TaskDal           = require('../dal/task');


/**
 * Create a user.
 *
 * @desc create a user using basic Authentication or Social Media
 *
 * @param {Function} next Middleware dispatcher
 *
 */
exports.create = function* createUser(next) {
  debug('create user');

  let isSuper = false;
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

  if(this.state._user.realm === 'super') {
      isSuper = true;
      if(body.user_role !== 'admin') {
        return this.throw(new CustomError({
          type: 'USER_CREATION_ERROR',
          message: "Super Admin Can Only Create An Account With 'admin' role Type"
        }));
      }
  } else {
    let isPermitted = yield checkPermissions({ user: this.state._user._id }, 'CREATE');
    if(!isPermitted) {
      return this.throw(new CustomError({
        type: 'USER_CREATION_ERROR',
        message: "You Don't have enough permissions to complete this action"
      }));
    }

  }
  
  let canAuthorize = yield checkPermissions({ user: this.state._user._id }, 'AUTHORIZE');

  let errors = [];

  if(!body.username) errors.push('Username is Empty');
  if(!body.password) {
    errors.push('Password is Empty');
  } else {
     if(!validator.isLength(body.password, {min:6})) errors.push('Password Must be at least 6 characters!!');
  }
 
  if(!body.role) {
    errors.push('Role Reference is Empty');
  } else {
    if(!validator.isMongoId(body.role)) errors.push('Role Reference is not a Valid Mongo ID');
  }
  
  if(!body.first_name) errors.push('First Name is Empty');
  if(!body.last_name) errors.push('Last Name is Empty');
  if(!body.default_branch) {
    errors.push('Default Branch is Invalid');
  } else {
    if(!validator.isMongoId(body.default_branch)) errors.push('Default Branch Reference is not a Valid Mongo ID');
  }
  if(!body.user_role) errors.push('User Role is Empty');

  if(errors.length) {
    return this.throw(new CustomError({
      type: 'USER_CREATION_ERROR',
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

    let user = yield UserDal.get({ username: body.username });

    if(user) {
      throw new Error('An User with those Credentials already exists');

    } else {
    // Create User 
    user = yield UserDal.create({
      username: body.username,
      password: body.password,
      role: body.user_role,
      created_by: this.state._user.username,
      status: isSuper ? 'active'  : (canAuthorize ? 'active': 'pending')
    });

    body.user = user._id;
    delete body.role;

    // Create Account Type
    let account = yield AccountDal.create(body);

    // Update User with Account
    user = yield UserDal.update({ _id: user._id }, { account: account._id });

   if(!canAuthorize || !isSuper) {
       // Create Task
      yield TaskDal.create({
        task: `Approve New Account of ${body.first_name} ${body.last_name}`,
        task_type: 'approve',
        entity_ref: account._id,
        entity_type: 'account',
        created_by: this.state._user._id
      });
   }
    
    this.status = 201;
    this.body = user;

    }


  } catch(ex) {
    return this.throw(new CustomError({
      type: 'USER_CREATION_ERROR',
      message: ex.message
    }));
  }


};


/**
 * Get a single user.
 *
 * @desc Fetch a user with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneUser(next) {
  debug(`fetch user: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let user = yield UserDal.get(query);

    yield LogDal.track({
      event: 'view_user',
      user: this.state._user._id ,
      message: `View user - ${user.username}`
    });

    this.body = user;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'USER_RETRIEVAL_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Update User Status
 *
 * @desc Fetch a user with the given ID and update their respective status.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updateStatus = function* updateUser(next) {
  debug(`updating status user: ${this.params.id}`);

  this.checkBody('status')
      .notEmpty('Status should not be empty')
      .isIn(['suspend', 'approved', 'pending'], 'Status should be suspended, pending or approved')

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let account = yield AccountDal.get({ user: query._id });

    if(body.status === 'suspended') {
      // Create Task
      yield TaskDal.create({
        task: `Deactivate Account of ${account.first_name} ${account.last_name}`,
        task_type: 'update',
        entity_ref: account._id,
        entity_type: 'account'
      })
    } else if(body.status === 'approved') {
      // Create Task
      yield TaskDal.create({
        task: `Activate Account of ${account.first_name} ${account.last_name}`,
        task_type: 'update',
        entity_ref: account._id,
        entity_type: 'account'
      })
    } else {
      yield UserDal.update(query, body);
    }

    yield LogDal.track({
      event: 'user_status_update',
      user: this.state._user._id ,
      message: `Update Status for ${user.username}`,
      diff: body
    });

    this.body = user;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'USER_STATUS_UPDATE_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Update a single user.
 *
 * @desc Fetch a user with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateUser(next) {
  debug(`updating user: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let user = yield UserDal.update(query, body);

    yield LogDal.track({
      event: 'user_update',
      user: this.state._user._id ,
      message: `Update Info for ${user.email}`,
      diff: body
    });

    this.body = user;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_USER_ERROR',
      message: ex.message
    }));

  }

};



/**
 * Get a collection of users by Pagination
 *
 * @desc Fetch a collection of users
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllUsers(next) {
  debug('get a collection of users by pagination');

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
    let users = yield UserDal.getCollectionByPagination(query, opts);

    this.body = users;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'FETCH_PAGINATED_USERS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};

/**
 * Delete a single user.
 *
 * @desc Delete/Archive a user with the given id
 *
 * @param {Function} next Middleware dispatcher
 */
exports.remove = function* removeUser(next) {
  debug(`delete user: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let user = yield UserDal.get(query);
    if(user.archived) {
      throw new Error('User is not Available');
    }
    let account = yield AccountDal.get({ user: user._id });

    if(user.status === 'pending') {
      yield UserDal.update(query, {
        status: 'archived',
        archived: true
      });

      yield AccountDal.update({ user: user._id },{
        archived: true
      })
    } else if(user.status === 'approved') {
      // Create Task
      yield TaskDal.create({
        task: `Remove  Account of ${account.first_name} ${account.last_name}`,
        task_type: 'delete',
        entity_ref: account._id,
        entity_type: 'account'
      })
    }

    

    yield LogDal.track({
      event: 'user_update',
      user: this.state._user._id ,
      message: `Update Info for ${user.username}`,
      diff: body
    });

    this.body = user;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_USER_ERROR',
      message: ex.message
    }));

  }

};