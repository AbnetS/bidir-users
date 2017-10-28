/**
 * Load Module dependencies
 */
var debug = require('debug')('api:routes');

var pkg            = require('../package.json');
var MFIRouter      = require('./MFI');
var branchRouter   = require('./branch');

module.exports = function initRoutes(app) {
  debug('loading routes');

  app.use('/MFIs', MFIRouter);
  app.use('/branches', branchRouter);

  app.get('/', function (req, res) {
    res.json({
      name:       pkg.name,
      version:    pkg.version,
      description: pkg.description,
      documentation: config.DOCS_URL,
      uptime: process.uptime() + 's'
    });
  });

  debug('routes loaded');
};

// OPEN ENDPOINTS
module.exports.OPEN_ENDPOINTS = [
    /\/media\/.*/,
    /\/documentation\/.*/,
    '/users/login',
    '/users/signup',
    '/',
    '/MFIs/register'
];

