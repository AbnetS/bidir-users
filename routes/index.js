'use strict';

/**
 * Load Module Dependencies
 */
const Router = require('koa-router');
const debug  = require('debug')('api:app-router');

const rootRouter         = require('./root');
const accountRouter      = require('./account');
const userRouter  		 = require('./user');
const permissionRouter   = require('./permission');
const roleRouter  		 = require('./role');
const taskRouter       = require('./task');
const notificationRouter       = require('./notification');

var appRouter = new Router();

const OPEN_ENDPOINTS = [
    /\/assets\/.*/,
    '/users/permissions/create',
    '/users/roles/create',
    '/'
];

// Open Endpoints/Requires Authentication
appRouter.OPEN_ENDPOINTS = OPEN_ENDPOINTS;

// Add Root Router
composeRoute('', rootRouter);
//Add users Router
composeRoute('users', userRouter);
//Add Accounts Router
composeRoute('users/accounts', accountRouter);
//Add permissions Router
composeRoute('users/permissions', permissionRouter);
//Add roles Router
composeRoute('users/roles', roleRouter);
//Add tasks Router
composeRoute('users/tasks', taskRouter);
//Add Notifications Router
composeRoute('users/notifications', notificationRouter);

function composeRoute(endpoint, router){
  appRouter.use(`/${endpoint}`, router.routes(), router.allowedMethods());
}
// Export App Router
module.exports = appRouter;
