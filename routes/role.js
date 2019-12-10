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
 * @api {post} /users/roles/create Create Role
 * @apiVersion 1.0.0
 * @apiName CreateRole
 * @apiGroup Role
 *
 * @apiDescription Create new role. A role is a group of permissions.
 *
 * @apiParam {String} name Role Name
 * @apiParam {String} description Role Description
 * @apiParam {Array} permissions Permissions References
 *
 * @apiParamExample Request Example:
 *  {
 *    name: "Junior Loan Officer",
 *    description: "Role of a newly hired loan officer",
 *    permissions: ["5c597f8db711700001a016d5","5c597f7ab711700001a016d4"]
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
 *    name: "Junior Loan Officer",
 *    description: "Role of a newly hired loan officer",
 *    permissions: [{
 *	     _id : "5c597f8db711700001a016d5",
 *       name: "Create Group"
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
 {
    "total_pages": 1,
    "total_docs_count": 3,
    "current_page": 1,
    "docs": [
        {
            "_id": "5b925a48b1cfc10001d80929",
            "name": "Branch Manager"
            "permissions": [
                {
                    "_id": "5d07cccb8958650001a8001c",
                    "description": "View all groups from accessible branches",
                     ...
                },
                {
                    ...
                }
            ]                        
        },
        {
            ...
        }
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
     {
            "_id": "5b925a48b1cfc10001d80929",
            "name": "Branch Manager"
            "permissions": [
                {
                    "_id": "5d07cccb8958650001a8001c",
                    "description": "View all groups from accessible branches",
                     ...
                },
                {
                    ...
                }
            ]                        
        },
        {
            ...
        }
    }
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
 *    description: "Role of a newly hired loan officer, approval of loan documents is not permitted"
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
 *    name: "Junior Loan Officer",
 *    description: "Role of a newly hired loan officer, approval of loan documents is not permitted",
 *    permissions: [{
 *	     _id : "5c597f8db711700001a016d5",
 *       name: "Create Group"
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
 *    name: "Junior Loan Officer",
 *    description: "Role of a newly hired loan officer, approval of loan documents is not permitted",
 *    permissions: [{
 *	     _id : "5c597f8db711700001a016d5",
 *       name: "Create Group"
 *       ...
 *    }]
 *  }
 */
router.delete('/:id', acl(['*']), roleController.remove);


// Expose Role Router
module.exports = router;
