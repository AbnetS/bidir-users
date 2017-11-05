'use strict';

/**
 * Load Module Dependencies
 */
const Router = require('koa-router');
const debug  = require('debug')('api:app-router');

const rootRouter          = require('./root');
const accountRouter      = require('./account');
const clientRouter      = require('./client');

var appRouter = new Router();

const OPEN_ENDPOINTS = [
    /\/assets\/.*/,
    '/'
];

// Open Endpoints/Requires Authentication
appRouter.OPEN_ENDPOINTS = OPEN_ENDPOINTS;

// Add Root Router
composeRoute('', rootRouter);
//Add accounts Router
composeRoute('users', accountRouter);
//Add clients Router
composeRoute('users/clients', clientRouter);

function composeRoute(endpoint, router){
  appRouter.use(`/${endpoint}`, router.routes(), router.allowedMethods());
}
// Export App Router
module.exports = appRouter;
