'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:role-router');

const roleController  = require('../controllers/role');
const authController     = require('../controllers/auth');

const acl               = authController.accessControl;
var router  = Router();

/**
 * @api {post} /users/roles/create Create  Role
 * @apiVersion 1.0.0
 * @apiName CreateRole
 * @apiGroup Role
 *
 * @apiDescription Create new  role
 *
 * @apiParam {String} name Role Name
 * @apiParam {String} description Role Description
 * @apiParam {Array} permissions Permissions References
 *
 * @apiParamExample Request Example:
 *  {
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Roles",
 *    permissions: ['556e1174a8952c9521286a60']
 *  }
 *
 * @apiSuccess {String} _id role id
 * @apiSuccess {String} name Role Name
 * @apiSuccess {String} description Role Description
 * @apiSuccess {Array} permissions Permissions References
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Roles",
 *    permissions: [{
 *	     _id : "556e1174a8952c9521286a60",
 *       name: "Loan Application"
 *       ...
 *    }]
 *  }
 *
 */
router.post('/create', roleController.create);


/**
 * @api {get} /users/roles/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get roles collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup Role
 *
 * @apiDescription Get a collection of roles. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id role id
 * @apiSuccess {String} name Role Name
 * @apiSuccess {String} description Role Description
 * @apiSuccess {Array} permissions Permissions ie READ, UPDATE, DELETE, CREATE
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Roles",
 *    permissions: [{
 *	     _id : "556e1174a8952c9521286a60",
 *       name: "Loan Application"
 *       ...
 *    }],
 *    }]
 *  }
 */
router.get('/paginate', acl(['*']), roleController.fetchAllByPagination);

/**
 * @api {get} /users/roles/:id Get Role
 * @apiVersion 1.0.0
 * @apiName GetRole
 * @apiGroup Role
 *
 * @apiDescription Get a role with the given id
 *
 * @apiSuccess {String} _id role id
 * @apiSuccess {String} name Role Name
 * @apiSuccess {String} description Role Description
 * @apiSuccess {Array} permissions Permissions ie READ, UPDATE, DELETE, CREATE
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Loans Module Roles",
 *    permissions: [{
 *	     _id : "556e1174a8952c9521286a60",
 *       name: "Loan Application"
 *       ...
 *    }],
 *  }
 *
 */
router.get('/:id', acl(['*']), roleController.fetchOne);


/**
 * @api {put} /users/roles/:id Update Role
 * @apiVersion 1.0.0
 * @apiName UpdateRole
 * @apiGroup Role 
 *
 * @apiDescription Update a role with the given id
 *
 * @apiParam {Object} Data Update data
 *
 * @apiParamExample Request example:
 * {
 *    description: 'Loan officer Role'
 * }
 *
 * @apiSuccess {String} _id role id
 * @apiSuccess {String} name Role Name
 * @apiSuccess {String} description Role Description
 * @apiSuccess {Array} permissions Permissions References
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Role",
 *    permissions: [{
 *	     _id : "556e1174a8952c9521286a60",
 *       name: "Loan Application"
 *       ...
 *    }]
 *  }
 */
router.put('/:id', acl(['*']), roleController.update);

/**
 * @api {delete} /users/roles/:id Delete Role
 * @apiVersion 1.0.0
 * @apiName DeleteRole
 * @apiGroup Role 
 *
 * @apiDescription Delete a role with the given id
 *
 *
 * @apiSuccess {String} _id role id
 * @apiSuccess {String} name Role Name
 * @apiSuccess {String} description Role Description
 * @apiSuccess {Array} permissions Permissions References
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Loan Officer",
 *    description: "Loan Officer Role",
 *    permissions: [{
 *       _id : "556e1174a8952c9521286a60",
 *       name: "Loan Application"
 *       ...
 *    }]
 *  }
 */
router.delete('/:id', acl(['*']), roleController.remove);


// Expose Role Router
module.exports = router;
