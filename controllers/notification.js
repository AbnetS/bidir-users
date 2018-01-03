'use strict';
/**
 * Load Module Dependencies.
 */
const crypto  = require('crypto');
const path    = require('path');
const url     = require('url');

const debug      = require('debug')('api:notification-controller');
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
const UserDal            = require('../dal/user');
const AccountDal         = require('../dal/account');
const ScreeningDal       = require('../dal/screening');
const NotificationDal    = require('../dal/notification');

/**
 * Get a single notification.
 *
 * @desc Fetch a notification with the given id from the database.
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchOne = function* fetchOneNotification(next) {
  debug(`fetch notification: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };

  try {
    let notification = yield NotificationDal.get(query);

    yield LogDal.track({
      event: 'view_notification',
      notification: this.state._user._id ,
      message: `View notification - ${notification._id}`
    });

    this.body = notification;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'NOTIFICATION_RETRIEVAL_ERROR',
      message: ex.message
    }));
  }

};

/**
 * Update a single notification.
 *
 * @desc Fetch a notification with the given id from the database
 *       and update their data
 *
 * @param {Function} next Middleware dispatcher
 */
exports.update = function* updateNotification(next) {
  debug(`updating notification: ${this.params.id}`);

  let query = {
    _id: this.params.id
  };
  let body = this.request.body;

  try {
    let notification = yield NotificationDal.update(query, body);

    yield LogDal.track({
      event: 'notification_update',
      notification: this.state._user._id ,
      message: `Update Info for ${notification._id}`,
      diff: body
    });

    this.body = notification;

  } catch(ex) {
    return this.throw(new CustomError({
      type: 'UPDATE_NOTIFICATION_ERROR',
      message: ex.message
    }));

  }

};

/**
 * Get a collection of notifications by Pagination
 *
 * @desc Fetch a collection of notifications
 *
 * @param {Function} next Middleware dispatcher
 */
exports.fetchAllByPagination = function* fetchAllNotifications(next) {
  debug('get a collection of notifications by pagination');


  // retrieve pagination query params
  let page   = this.query.page || 1;
  let limit  = this.query.per_page || 10;
  let query =  this.query.query || {};

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
    
    if(user.role != 'super' && user.realm != 'super') {
      query.for = user._id;
    }

    let notifications = yield NotificationDal.getCollectionByPagination(query, opts);

    this.body = notifications;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'GET_NOTIFICATIONS_COLLECTION_ERROR',
      message: ex.message
    }));
  }
};

/**
 * Get a user notifications 
 *
 * @desc Fetch a collection of notifications for a given user
 *
 * @param {Function} next Middleware dispatcher
 */
exports.getUserNotifications = function* getUserNotifications(next) {
  debug('get a collection of notifications for a given user');

  // retrieve pagination query params
  let page   = this.query.page || 1;
  let limit  = this.query.per_page || 10;
  let query =  {
    for: this.params.id
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

    let notifications = yield NotificationDal.getCollectionByPagination(query, opts);

    this.body = notifications;
  } catch(ex) {
    return this.throw(new CustomError({
      type: 'GET_USER_NOTIFICATIONS_ERROR',
      message: ex.message
    }));
  }
};

