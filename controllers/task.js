'use strict';
/**
 * Load Module Dependencies.
 */
const crypto  = require('crypto');
const path    = require('path');
const url     = require('url');

const debug      = require('debug')('api:task-controller');
const moment     = require('moment');
const jsonStream = require('streaming-json-stringify');
const _          = require('lodash');
const co         = require('co');
const del        = require('del');
const validator  = require('validator');

const config             = require('../config');
const CustomError        = require('../lib/custom-error');
const checkPermissions   = require('../lib/permissions');


const LogDal             = require('../dal/log');
const TaskDal            = require('../dal/task');
const UserDal            = require('../dal/user');
const AccountDal         = require('../dal/account');
const ScreeningDal       = require('../dal/screening');
const NotificationDal    = require('../dal/notification');

/**
 * Get a single task.
 *
 * @desc Fetch a task with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneTask(next) {
  debug(`fetch task: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let task = yield TaskDal.get(query);

    yield LogDal.track({
      event: 'view_task',
      task: this.state._user._id ,
      message: `View task - ${task.email}`
    });

    this.body = task;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'TASK_RETRIEVAL_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Update Task Status
 *
 * @desc Fetch a task with the given ID and update their respective status.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.updateStatus = function* updateTask(next) {
  debug(`updating status task: ${this.params.id}`);

  this.checkBody('status')
      .notEmpty('Status should not be empty');

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;
  let user = this.state._user;

  try {
    let task;
    let account = yield AccountDal.get({ user: user._id });
    let canApprove = false;
    let canAuthorize = false;
    let canDelete = false;
    let canRead = false;
    let canModify = false;
    let canCreate = false;
    let canActivate = false;
    let canDeactivate = false;

    for(let permission of account.role.permissions) {
      let operation = permission.operation;

      if(operation === 'AUTHORIZE') canAuthorize = true;
      if(operation === 'DELETE') canDelete = true;
      if(operation === 'VIEW') canRead = true;
      if(operation === 'UPDATE') canModify = true;
      if(operation === 'CREATE') canCreate = true;
      if(operation === 'ACTIVATE') canActivate = true;
      if(operation === 'DEACTIVATE') canDeactivate = true;
    }

    task = yield TaskDal.get(query);

    if(body.action === 'approved') {
      if(!canAuthorize) throw new Error('You are not allowed to complete this action');

      switch(task.entity_type) {
        case 'account':
          let created = yield AccountDal.get({ _id: task_ref });
          yield UserDal.update({ account: task.entity_ref }, { status: 'active '});
          yield NotificationDal.create({
            for: task.created_by,
            message: `Account of ${created.first_name} ${created.last_name} has been approved`
          });
          task = yield TaskDal.update(query, { status: 'done', comment: body.comment });
          break;
        case 'screening':
          yield ScreeningDal.update({ _id: task.entity_ref }, { status: 'approved '});
          break;
      }
    } else if(body.action === 'declined') {
      if(!canAuthorize) throw new Error('You are not allowed to complete this action');

      switch(task.entity_type) {
        case 'account':
          let created = yield AccountDal.get({ _id: task_ref });
          yield UserDal.update({ account: task.entity_ref }, { status: 'declined '});
          yield NotificationDal.create({
            for: task.created_by,
            message: `New Account of ${created.first_name} ${created.last_name} has been declined. Review Task`
          });
          task = yield TaskDal.update(query, { comment: body.comment });
          break;
        case 'screening':
          yield ScreeningDal.update({ _id: task.entity_ref }, { status: 'approved '});
          break;
      }
    }

    yield LogDal.track({
      event: 'task_status_update',
      user: this.state._user._id,
      message: `Update Status for ${task.task_type}`,
      diff: body
    });

    this.body = task;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'TASK_STATUS_UPDATE_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Update a single task.
 *
 * @desc Fetch a task with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateTask(next) {
  debug(`updating task: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let task = yield TaskDal.update(query, body);

    yield LogDal.track({
      event: 'task_update',
      task: this.state._user._id ,
      message: `Update Info for ${task.email}`,
      diff: body
    });

    this.body = task;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_TASK_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Get a collection of tasks by Pagination
 *
 * @desc Fetch a collection of tasks
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllTasks(next) {
  debug('get a collection of tasks by pagination');

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

  let isSuper;

  if(this.state._user.realm === 'super' || this.state._user.role === 'super') {
      isSuper = true;
  } else {
    let isPermitted = yield checkPermissions({ user: this.state._user._id }, 'AUTHORIZE');
    if(!isPermitted) {
      return this.throw(new CustomError({
        type: 'TASKS_COLLECTION_ERROR',
        message: "You Don't have enough permissions to complete this action"
      }));
    }
  }

  try {
    let account = yield AccountDal.get({ user: this.state._user._id });

    let tasks = yield TaskDal.getCollectionByPagination(query, opts);

    this.body = tasks;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'FETCH_PAGINATED_TASKS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};


/**
 * Remove a single Task.
 *
 * @desc Fetch a task with the given id from the database
 *       and Remove their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.remove = function* removeTask(next) {
  debug(`removing task: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let task = yield TaskDal.delete(query);
    if(!task) {
      throw new Error('Task Does Not Exist!');
    }

    yield LogDal.track({
      event: 'task_delete',
      permission: this.state._user._id ,
      message: `Delete Info for ${task._id}`
    });

    this.body = task;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'REMOVE_TASK_ERROR',
      message: ex.message
    }));

  }

};