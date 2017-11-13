'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:permission-router');

const permissionController  = require('../controllers/permission');
const authController     = require('../controllers/auth');

const acl               = authController.accessControl;
var router  = Router();

/**
 * @api {post} /users/permissions/create Create  Permission
 * @apiVersion 1.0.0
 * @apiName CreatePermission
 * @apiGroup Permission
 *
 * @apiDescription Create new  permission
 *
 * @apiParam {String} name Permission Name
 * @apiParam {String} description Permission Description
 * @apiParam {String} module Module
 * @apiParam {Array} endpoints Array of Endpoints
 * @apiParam {Array} operations Operations ie READ, UPDATE, DELETE, CREATE
 *
 * @apiParamExample Request Example:
 *  {
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Permissions",
 *    module: "LOAN_APPLICATION",
 *    operations: ['CREATE'],
 *    endpoints: []
 *  }
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 * @apiSuccess {Array} operations Operations ie READ, UPDATE, DELETE, CREATE
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Permissions",
 *    module: "LOAN_APPLICATION",
 *    operations: ['CREATE'],
 *    endpoints: []
 *  }
 *
 */
router.post('/create', permissionController.create);


/**
 * @api {get} /users/permissions/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get permissions collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup Permission
 *
 * @apiDescription Get a collection of permissions. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 * @apiSuccess {Array} operations Operations ie READ, UPDATE, DELETE, CREATE
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Permissions",
 *    module: "LOAN_APPLICATION",
 *    operations: ['CREATE'],
 *    endpoints: []
 *    }]
 *  }
 */
router.get('/paginate', acl(['*']), permissionController.fetchAllByPagination);

/**
 * @api {get} /users/permissions/:id Get Permission
 * @apiVersion 1.0.0
 * @apiName GetPermission
 * @apiGroup Permission
 *
 * @apiDescription Get a permission with the given id
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 * @apiSuccess {Array} operations Operations ie READ, UPDATE, DELETE, CREATE
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Permissions",
 *    module: "LOAN_APPLICATION",
 *    operations: ['CREATE'],
 *    endpoints: []
 *  }
 *
 */
router.get('/:id', acl(['*']), permissionController.fetchOne);


/**
 * @api {put} /users/permissions/:id Update Permission
 * @apiVersion 1.0.0
 * @apiName UpdatePermission
 * @apiGroup Permission 
 *
 * @apiDescription Update a permission with the given id
 *
 * @apiParam {Object} Data Update data
 *
 * @apiParamExample Request example:
 * {
 *    operations: ['CREATE', 'UPDATE']
 * }
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 * @apiSuccess {Array} operations Operations ie READ, UPDATE, DELETE, CREATE
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Permissions",
 *    module: "LOAN_APPLICATION",
 *    operations: ['CREATE', 'UPDATE'],
 *    endpoints: []
 *  }
 */
router.put('/:id', acl(['*']), permissionController.update);

// Expose Permission Router
module.exports = router;
