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
 * @apiParam {String} [description] Permission Description
 * @apiParam {String} entity Entity on which the permission is applied on
 * @apiParam {String} operation Operation i.e CREATE, READ, UPDATE, DELETE 
 * @apiParam {String} [module] Module
 * @apiParam {String[]} [endpoints] Array of Endpoints accessible to this permission
 * 
 * @apiParamExample Request Example:
 *  {
 *    "name": "Add User",
 *    "description": "Add a new user/Create a new user account to accessible branches",
      "module": "USER_MANAGEMENT",
      "operation": "CREATE",
      "entity": "USER",
      "endpoints": []    
 *  }
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description * 
 * @apiSuccess {String} operation Operations ie READ, UPDATE, DELETE, CREATE
 * @apiSuccess {String} entity Entity on which the permission is applied
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 * 
 *
 * @apiSuccessExample Response Example:
 *  {
 *      "_id": "5b9257c9b1cfc10001d80911",
 *      "name": "Add User",
 *      "description": "Add a new user/Create a new user account to accessible branches",
 *      "operation": "CREATE",
 *      "entity": "USER",
 *      "module": "USER_MANAGEMENT",
 *      "endpoints": []      
 *      "last_modified": "2018-09-07T10:49:45.714Z",
 *      "date_created": "2018-09-07T10:49:45.714Z",
        
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
 * @apiSuccess {String} operation Operations ie READ, UPDATE, DELETE, CREATE
 * @apiSuccess {String} entity Entity on which the permission is applied
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 *
 * @apiSuccessExample Response Example:
 * {
        "total_pages": 1,
        "total_docs_count": 54,
        "current_page": 1,
        "docs": [
            {
                "description": "Generate various types of reports",
                "_id": "5db6c65dc77931b719f92fa5",
                "name": "Generate Reports",
                "module": "REPORT_GENERATOR",
                "operation": "VIEW",
                "entity": "REPORT",
                "endpoints": [],
                "date_created": "2019-10-28T10:43:41.834Z",
                "last_modified": "2019-10-28T10:43:41.834Z"
            },
            {
                ...
            }
        ]
    }
 */
router.get('/paginate', acl(['*']), permissionController.fetchAllByPagination);

/**
 * @api {get} /users/permissions/groups Get grouped permissions
 * @apiVersion 1.0.0
 * @apiName GetGroupedPermissions
 * @apiGroup Permission
 *
 * @apiDescription Get a collection of permissions grouped by module.
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description  
 * @apiSuccess {String} operation Operations ie READ, UPDATE, DELETE, CREATE
 * @apiSuccess {String} entity Entity on which the permission is applied
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 *
 * @apiSuccessExample Response Example:
 *  {
        "MFI_SETUP": [
            {
                "description": "View accessible branches list and detail information of each branch",
                "_id": "5b925791b1cfc10001d8090d",
                "last_modified": "2018-09-07T10:48:49.147Z",
                "date_created": "2018-09-07T10:48:49.147Z",
                "name": "View Branch",
                "module": "MFI_SETUP",
                "operation": "VIEW",
                "entity": "BRANCH",
                "endpoints": []
            },
            {
                ...
            }],
        "USER_MANAGEMENT": [
        {
            "description": "Add a new user/Create a new user account to accessible branches",
            "_id": "5b9257c9b1cfc10001d80911",
            "last_modified": "2018-09-07T10:49:45.714Z",
            "date_created": "2018-09-07T10:49:45.714Z",
            "name": "Add User",
            "module": "USER_MANAGEMENT",
            "operation": "CREATE",
            "entity": "USER",
            "endpoints": []
        },
        {
            ...
        }], ...
    }
   
 */
router.get('/groups', acl(['*']), permissionController.getByModules);

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
 * @apiSuccess {String} operation Operations ie READ, UPDATE, DELETE, CREATE
 * @apiSuccess {String} entity Entity on which the permission is applied
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 *
 * @apiSuccessExample Response Example:    
 *  {
 *      "_id": "5b9257c9b1cfc10001d80911",
 *      "name": "Add User",
 *      "description": "Add a new user/Create a new user account to accessible branches",
 *      "operation": "CREATE",
 *      "entity": "USER",
 *      "module": "USER_MANAGEMENT",
 *      "endpoints": []      
 *      "last_modified": "2018-09-07T10:49:45.714Z",
 *      "date_created": "2018-09-07T10:49:45.714Z"        
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
 *    operation: 'UPDATE'
 * }
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description  
 * @apiSuccess {String} operation Operations ie READ, UPDATE, DELETE, CREATE
 * @apiSuccess {String} entity Entity on which the permission is applied
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Update Loan Application",
 *    description: "Update loan application",
 *    module: "LOAN_APPLICATION",
 *    operations: 'UPDATE',
 *    entity: "LOAN_APPLICATION",
 *    endpoints: []
 *  }
 */
router.put('/:id', acl(['*']), permissionController.update);

/**
 * @api {delete} /users/permissions/:id Delete Permission
 * @apiVersion 1.0.0
 * @apiName DeletePermission
 * @apiGroup Permission 
 *
 * @apiDescription Update a permission with the given id
 *
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {String} name Permission Name
 * @apiSuccess {String} description Permission Description  
 * @apiSuccess {String} operation Operations ie READ, UPDATE, DELETE, CREATE
 * @apiSuccess {String} entity Entity on which the permission is applied
 * @apiSuccess {String} module Module
 * @apiSuccess {Array} endpoints Array of Endpoints
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60",
 *    name: "Update Loan Application",
 *    description: "Update loan application",
 *    module: "LOAN_APPLICATION",
 *    operations: 'UPDATE',
 *    entity: "LOAN_APPLICATION",
 *    endpoints: []
 *  }
 */
router.delete('/:id', acl(['*']), permissionController.remove);


// Expose Permission Router
module.exports = router;
