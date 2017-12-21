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
const ClientDal          = require('../dal/client');
const LoanDal            = require('../dal/loan');

let hasPermission = checkPermissions.isPermitted('TASK');

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

  let isPermitted = yield hasPermission(this.state._user, 'AUTHORIZE');
  if(!isPermitted) {
    return this.throw(new CustomError({
      type: 'TASK_STATUS_UPDATE_ERROR',
      message: "You Don't have enough permissions to complete this action"
    }));
  }

  this.checkBody('status')
      .notEmpty('Status should not be empty');

  if(this.errors) {
    return this.throw(new CustomError({
      type: 'TASK_STATUS_UPDATE_ERROR',
      message: JSON.stringify(this.errors)
    }));
  }

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  let task = yield TaskDal.get(query);
  if(!task) {
    throw new Error('Task Is Not Known!');
  }

  if(task.entity_type === 'screening') {
      this.checkBody('status')
          .isIn(['approved', 'declined_final', 'declined_under_review'], 'Required status types for screening task is approved, declined_final or declined_under_review');
  }

  if(task.entity_type === 'loan') {
      this.checkBody('status')
          .isIn(['accepted', 'declined_final', 'declined_under_review'], 'Required status types for screening task is accepted, declined_final or declined_under_review');
  }

  if(this.errors) {
    return this.throw(new CustomError({
      type: 'TASK_STATUS_UPDATE_ERROR',
      message: JSON.stringify(this.errors)
    }));
  }

  try {

    let client;

    switch(task.entity_type) {
      case 'screening':
        let screening = yield ScreeningDal.get({ _id: task.entity_ref });
        client    = yield ClientDal.get({ _id: screening.client });
        
        if(body.status === 'approved') {
          screening = yield ScreeningDal.update({ _id: screening._id }, { status: body.status });
          client    = yield ClientDal.update({ _id: client._id }, { status: 'eligible' });
          yield NotificationDal.create({
            for: task.created_by,
            message: `Screening Application of ${client.first_name} ${client.last_name} has been approved`,
            task_ref: task._id
          });


        } else if(body.status === 'declined_final') {
          screening = yield ScreeningDal.update({ _id: screening._id }, { status: body.status });
          client    = yield ClientDal.update({ _id: client._id }, { status: 'ineligible' });
          yield NotificationDal.create({
            for: task.created_by,
            message: `Screening Application of ${client.first_name} ${client.last_name} has been declined in Final`,
            task_ref: task._id
          });

        } else if(body.status === 'declined_under_review') {
          screening = yield ScreeningDal.update({ _id: screening._id }, { status: 'inprogress' });
          client    = yield ClientDal.update({ _id: client._id }, { status: 'ineligible' });
          yield NotificationDal.create({
            for: task.created_by,
            message: `Screening Application of ${client.first_name} ${client.last_name} has been declined For Further Review`,
            task_ref: task._id
          });
        }

        task = yield TaskDal.update(query, { status: 'done', comment: body.comment });
        break;
      case 'loan':
        let loan      = yield LoanDal.get({ _id: task.entity_ref });
        client    = yield ClientDal.get({ _id: loan.client });
        
        if(body.status === 'accepted') {
          loan      = yield LoanDal.update({ _id: loan._id }, { status: body.status });
          //client    = yield ClientDal.update({ _id: client._id }, { status: 'eligible' });
          yield NotificationDal.create({
            for: task.created_by,
            message: `Loan Application of ${client.first_name} ${client.last_name} has been accepted`,
            task_ref: task._id
          });


        } else if(body.status === 'declined_final') {
          loan      = yield LoanDal.update({ _id: loan._id }, { status: body.status });
          //client    = yield ClientDal.update({ _id: client._id }, { status: 'ineligible' });
          yield NotificationDal.create({
            for: task.created_by,
            message: `Loan Application  of ${client.first_name} ${client.last_name} has been declined in Final`,
            task_ref: task._id
          });

        } else if(body.status === 'declined_under_review') {
          loan      = yield LoanDal.update({ _id: loan._id }, { status: body.status });
          //client    = yield ClientDal.update({ _id: client._id }, { status: 'ineligible' });
          yield NotificationDal.create({
            for: task.created_by,
            message: `Loan Application of ${client.first_name} ${client.last_name} has been declined For Further Review`,
            task_ref: task._id
          });

        }

        task = yield TaskDal.update(query, { status: 'done', comment: body.comment });
        break;
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
  sortType ? (sort[sortType] = -1) : (sort.date_created = -1 );

  let opts = {
    page: +page,
    limit: +limit,
    sort: sort
  };

  let isAuthorized = yield hasPermission(this.state._user, 'AUTHORIZE');

  try {

    if(isAuthorized) {
      query = {
        user: { $in: [null, this.state._user._id ] }
      };
    } else {
      query = {
        user: this.state._user._id
      };
    }

    let tasks = yield TaskDal.getCollectionByPagination(query, opts);

    this.body = tasks;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'TASKS_COLLECTION_ERROR',
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