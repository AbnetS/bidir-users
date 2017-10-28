/**
 *
 * Load Module Dependencies.
 */
var EventEmitter = require('events').EventEmitter;
var crypto       = require('crypto');

var debug     = require('debug')('api:user-controller');
var async     = require('async');
var moment    = require('moment');
var validator = require('validator');
var _         = require('lodash');

var Token     = require('../dal/token');
var config    = require('../config');
var CustomError = require('../lib/custom-error');


exports.accessControl = function accessControl(roles, action) {
  debug('Access controll management');

  action = action || 'ALLOW';

  return function (req, res, next) {
    var user = req._user;

    if(!user) {
      return next(CustomError({
        name: 'AUTHORIZATION_ERROR',
        message: 'Please Login or register to continue'
      }));
    }

    var userRole  = user.role;
    var userRealm = user.realm;
    var allowed   = false;

    roles = Array.isArray(roles) ? roles: [roles];

    roles.forEach(function(role) {
      switch(role) {
        case '*':
        case userRole:
        case userRealm:
          allowed = true;
          break;
      }

    });

    if(!allowed) {
      return next(CustomError({
        name: 'AUTHORIZATION_ERROR'
      }));

    } else {
      return next();

    }

  };
};
