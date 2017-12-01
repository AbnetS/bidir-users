'use strict';

/**
 * Load Module Dependencies.
 */
const debug = require('debug')('api:check-permissions');
const co    = require('co');

const User        = require('../dal/user');
const Account     = require('../dal/account');
const Permission  = require('../dal/permission');
const Role        = require('../dal/role');

module.exports = function isPermitted(query, action) {
  debug('Checking Account: ', query, ' Permission: ', action);

  return co(function* (){
    let account = yield Account.get(query);
    let role = yield Role.get({ _id: account.role._id });
    let isAllowed = false;

    for(let permission of role.permissions) {
      for(let operation of permission.operations) {
          if(operation.toUpperCase() === action) {
            isAllowed = true;
          }
      }
    }

    return isAllowed;

  });

 };
