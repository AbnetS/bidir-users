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

const Account            = require('../models/account');

const LogDal             = require('../dal/log');
const TaskDal            = require('../dal/task');
const UserDal            = require('../dal/user');
const AccountDal         = require('../dal/account');
const ScreeningDal       = require('../dal/screening');
const NotificationDal    = require('../dal/notification');
const ClientDal          = require('../dal/client');
const LoanDal            = require('../dal/loan');
const ClientACATDal      = require('../dal/clientACAT');

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
          .notEmpty('Status should not be empty')
          .isIn(['approved', 'declined_final', 'declined_under_review'], 'Required status types for screening task is approved, declined_final or declined_under_review');
  } else if(task.entity_type === 'loan') {
      this.checkBody('status')
          .notEmpty('Status should not be empty')
          .isIn(['accepted', 'rejected', 'declined_under_review'], 'Required status types for screening task is accepted, rejected or declined_under_review');

  } else if(task.entity_type === 'clientACAT') {
      this.checkBody('status')
          .notEmpty('Status should not be empty')
          .isIn(['resubmitted','submitted', 'loan_granted', 'declined_for_review', 'authorized'], "Correct Status is either resubmitted, submitted, loan_granted, declined_for_review or authorized");

  } else {
    this.checkBody('status')
          .notEmpty('Status should not be empty')
          .isIn(['completed', 'cancelled'], 'Required status types for task is completed or cancelled');
  }

  if(this.errors) {
    return this.throw(new CustomError({
      type: 'TASK_STATUS_UPDATE_ERROR',
      message: JSON.stringify(this.errors)
    }));
  }

  if(task.task_type != 'review') {
    let isPermitted = false;
    if(task.entity_type == 'screening') {
      let hasPermission = checkPermissions.isPermitted('SCREENING');
      isPermitted = yield hasPermission(this.state._user, 'AUTHORIZE');
      
    } else if(task.entity_type == 'loan') {
      let hasPermission = checkPermissions.isPermitted('LOAN');
      isPermitted = yield hasPermission(this.state._user, 'AUTHORIZE');

    } else if(task.entity_type == 'clientACAT') {
      let hasPermission = checkPermissions.isPermitted('ACAT');
      isPermitted = yield hasPermission(this.state._user, 'AUTHORIZE');

    } 

    if(!isPermitted) {
      return this.throw(new CustomError({
        type: 'TASK_STATUS_UPDATE_ERROR',
        message: "You Don't have enough permissions to complete this action"
      }));
    }
  }

  try {
    

    switch(task.entity_type) {
      case 'screening':
        task = yield processScreeningTasks(task, body);
        break;
      case 'loan':
        task = yield processLoanTasks(task, body);
        break;

      case 'clientACAT':
        task = yield processACATTasks(task, body);
        break;

      default:
        task = yield TaskDal.update(query, { status: body.status , comment: body.comment });
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

  let screeningPermission =  checkPermissions.isPermitted('SCREENING');
  let loanPermission =  checkPermissions.isPermitted('LOAN');

  let canViewScreening =  yield screeningPermission(this.state._user, 'AUTHORIZE');
  let canViewLoan = yield loanPermission(this.state._user, 'AUTHORIZE')


  try {
    let user = this.state._user;
    let account = yield Account.findOne({ user: user._id }).exec();

    if(account) {
      if(canViewLoan && canViewScreening) {
        query = {
          user: { $in: [null, this.state._user._id ] },
          entity_type: { $in: ['screening', 'loan'] }
        };

      } else if(canViewScreening) {
        query = {
          user: { $in: [null, this.state._user._id ] },
          entity_type: 'screening'
        };
      } else if(canViewLoan) {
        query = {
          user: { $in: [null, this.state._user._id ] },
          entity_type: 'loan'
        };

      } else {
        query = {
          user: this.state._user._id
        };
      }

      if(account.access_branches.length) {
          query.branch = { $in: account.access_branches };

      } else if(account.default_branch) {
          query.branch = account.default_branch;

      }
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

// Utilities
function processScreeningTasks(task, body) {
  return co(function* () {
    let screening = yield ScreeningDal.get({ _id: task.entity_ref });
    let client    = yield ClientDal.get({ _id: screening.client });
    
    if(body.status === 'approved') {
      screening = yield ScreeningDal.update({ _id: screening._id }, { status: body.status, comment: body.comment  });
      client    = yield ClientDal.update({ _id: client._id }, { status: 'eligible' });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Screening Application of ${client.first_name} ${client.last_name} has been approved`,
        task_ref: task._id
      });
      task = yield TaskDal.update(query, { status: 'completed', comment: body.comment });


    } else if(body.status === 'declined_final') {
      screening = yield ScreeningDal.update({ _id: screening._id }, { status: body.status, comment: body.comment  });
      client    = yield ClientDal.update({ _id: client._id }, { status: 'ineligible' });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Screening Application of ${client.first_name} ${client.last_name} has been declined in Final`,
        task_ref: task._id
      });
      task = yield TaskDal.update(query, { status: 'completed', comment: body.comment });

    } else if(body.status === 'declined_under_review') {
      screening = yield ScreeningDal.update({ _id: screening._id }, { status: body.status, comment: body.comment  });
      client    = yield ClientDal.update({ _id: client._id }, { status: 'screening_inprogress' });
      task = yield TaskDal.update(query, { status: 'completed', comment: body.comment });
      // Create Review Task
      let _task = yield TaskDal.create({
        task: `Review Screening Application of ${client.first_name} ${client.last_name}`,
        task_type: 'review',
        entity_ref: screening._id,
        entity_type: 'screening',
        created_by: this.state._user._id,
        user: task.created_by,
        comment: body.comment,
        branch: screening.branch
      })
      yield NotificationDal.create({
        for: this.state._user._id,
        message: `Screening Application of ${client.first_name} ${client.last_name} has been declined For Further Review`,
        task_ref: _task._id
      });
    }

    return task;
  });
}

function processLoanTasks(task, body){
  return co(function* () {
    let loan      = yield LoanDal.get({ _id: task.entity_ref });
    let client    = yield ClientDal.get({ _id: loan.client });
    
    if(body.status === 'accepted') {
      loan      = yield LoanDal.update({ _id: loan._id }, { status: body.status, comment: body.comment  });
      client    = yield ClientDal.update({ _id: client._id }, { status: 'loan_application_accepted' });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Loan Application of ${client.first_name} ${client.last_name} has been accepted`,
        task_ref: task._id
      });
      task = yield TaskDal.update(query, { status: 'completed', comment: body.comment });


    } else if(body.status === 'rejected') {
      loan      = yield LoanDal.update({ _id: loan._id }, { status: body.status, comment: body.comment  });
      client    = yield ClientDal.update({ _id: client._id }, { status: 'loan_application_rejected' });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Loan Application  of ${client.first_name} ${client.last_name} has been rejected in Final`,
        task_ref: task._id
      });
      task = yield TaskDal.update(query, { status: 'completed', comment: body.comment });

    } else if(body.status === 'declined_under_review') {
      loan      = yield LoanDal.update({ _id: loan._id }, { status: body.status, comment: body.comment  });
      client    = yield ClientDal.update({ _id: client._id }, { status: 'loan_application_inprogress' });
      task = yield TaskDal.update(query, { status: 'completed', comment: body.comment });
      // Create Review Task
      let _task = yield TaskDal.create({
        task: `Review Loan Application of ${client.first_name} ${client.last_name}`,
        task_type: 'review',
        entity_ref: loan._id,
        entity_type: 'loan',
        created_by: this.state._user._id,
        user: task.created_by,
        comment: body.comment,
        branch: loan.branch
      })
      yield NotificationDal.create({
        for: this.state._user._id,
        message: `Loan Application of ${client.first_name} ${client.last_name} has been declined For Further Review`,
        task_ref: _task._id
      });

    }
  });
}

function processACATTasks(task, body){
  return co(function* () {
    let clientACAT      = yield ClientACATDal.get({ _id: task.entity_ref });
    let client    = yield ClientDal.get({ _id: clientACAT.client._id });
    
    if(body.status === 'authorized') {
      clientACAT  = yield ClientACATDal.update({ _id: clientACAT._id }, { status: body.status, comment: body.comment  });
      client      = yield ClientDal.update({ _id: client._id }, { status: 'ACAT_authorized' });
      task        = yield TaskDal.update(query, { status: 'completed', comment: body.comment });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Client ACAT Application of ${client.first_name} ${client.last_name} has been Authorized`,
        task_ref: _task._id
      });

    } else if(body.status === 'resubmitted') {
      clientACAT  = yield ClientACATDal.update({ _id: clientACAT._id }, { status: body.status, comment: body.comment  });
      client      = yield ClientDal.update({ _id: client._id }, { status: 'ACAT_resubmitted' });
      task        = yield TaskDal.update(query, { status: 'completed', comment: body.comment });
      // Create Review Task
      let _task = yield TaskDal.create({
        task: `Review Client ACAT Application of ${client.first_name} ${client.last_name}`,
        task_type: 'review',
        entity_ref: clientACAT._id,
        entity_type: 'clientACAT',
        created_by: this.state._user._id,
        user: clientACAT.created_by._id,
        comment: body.comment,
        branch: client.branch._id
      });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Client ACAT Application of ${client.first_name} ${client.last_name} has been Resubmitted`,
        task_ref: _task._id
      });

    } else if(body.status === 'declined_for_review') {
      clientACAT  = yield ClientACATDal.update({ _id: clientACAT._id }, { status: body.status, comment: body.comment  });
      client      = yield ClientDal.update({ _id: client._id }, { status: 'ACAT_declined_for_review' });
      task        = yield TaskDal.update(query, { status: 'completed', comment: body.comment });
      // Create Review Task
      let _task = yield TaskDal.create({
        task: `Review Client ACAT Application of ${client.first_name} ${client.last_name}`,
        task_type: 'review',
        entity_ref: clientACAT._id,
        entity_type: 'clientACAT',
        created_by: this.state._user._id,
        user: clientACAT.created_by._id,
        comment: body.comment,
        branch: client.branch._id
      });
      yield NotificationDal.create({
        for: task.created_by,
        message: `Client ACAT Application of ${client.first_name} ${client.last_name} has been declined For Further Review`,
        task_ref: _task._id
      });

    }
  });
}