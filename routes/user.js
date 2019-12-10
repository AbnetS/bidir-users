'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:user-router');

const userController  = require('../controllers/user');
const authController     = require('../controllers/auth');

const acl               = authController.accessControl;
var router  = Router();

/**
 * @api {post} /users/create Create new User
 * @apiVersion 1.0.0
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiDescription Create a new user
 *
 * @apiParam {String} username Unique username
 * @apiParam {String} password Password, minimum length of password is 6
 * @apiParam {String} first_name First Name
 * @apiParam {String} last_name Last Name
 * @apiParam {String} [grandfather_name] Grandfather name
 * @apiParam {String} default_branch Default Branch for User
 * @apiParam {String} role Reference to Role asigned to the user
 * @apiParam {Object} picture Profile Picture _SUBMIT IN MULTIPART/FORM-DATA__
 * @apiParam {Bollean} [multi_branches] An attribute to indicate a user is allowed to access data of all branches 
 * @apiParam {String[]} [access_branches] All branches accessible to the user 
 * @apiParam {String} [title] Title 
 * @apiParam {String} [gender] Gender
 * @apiParam {String} [email] Email Address
 * @apiParam {String} [phone] Phone number of the user
 * @apiParam {String} [city] City
 * @apiParam {String} [Country] Country
 * @apiParam {Date} [hired_date] Date on which the employee is hired, if applicable
 *
 * 
 *
 * @apiParamExample Request Example:
 *  {
 *     first_name: "Adane"
      last_name: "Kebede"
      username: "adane@test"
      password: "password"
      access_branches: ["5b9283679fb7f20001f1494d", "5b926c849fb7f20001f1494c"]
      default_branch: "5b9283679fb7f20001f1494d"    
      role: "5b9259d7b1cfc10001d80928"
      title: "Loan Officer"
      
 *  }
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {String} username Username
 * @apiSuccess {Object} account Account detail Data
 * @apiSuccess {Boolean} status active/suspended
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 * 
 *
 * @apiSuccessExample Response Example:
 *  {
   "_id": "5def0f20a7c38e11f72d8b07",
    "realm": "user",
    "role": "Junior_Officer",
    "status": "active",
    "archived": false,    
    "username": "hassen@test",
    "created_by": "super@bidir.com",
    "date_created": "2019-12-10T03:21:04.999Z",
    "last_modified": "2019-12-10T03:21:05.018Z",
    "last_login": "2019-12-10T03:21:04.999Z",
    "account": {
       "_id": "5def0f21a7c38e5a2d2d8b08"
        "picture": "",
        "title": "Loan Officer",
        "gender": "SELECT",
        "first_name": "Hassen",
        "last_name": "Mohammed",
        "email": "",
        "phone": "",
        "city": "SELECT",
        "country": "SELECT",
        "hired_date": null,
        "grandfather_name": "",
        "role": {
            "permissions": [
                {
                    "description": "Create a given group",
                    ...
                },
                {
                   ...
                }
            ],
            "_id": "5b9259d7b1cfc10001d80928",
            "name": "Junior Officer"
        },
        "default_branch": {
            "geolocation": {
                "longitude": 38.984703,
                "latitude": 7.530478
            },
            "opening_date": "1970-01-01T00:00:00.000Z",
            "branch_type": "Satellite office",
            "email": "test@buusaa.com",
            "phone": "",
            "status": "active",
            "weredas": [],
            "_id": "5b9283679fb7f20001f1494d",
            "last_modified": "2019-12-07T09:13:41.119Z",
            "date_created": "2018-09-07T13:55:51.227Z",
            "name": "Test Branch",
            "location": "test"
        },
        "access_branches": [
            {
               "_id": "5b9283679fb7f20001f1494d",
               "name": "Test Branch",               
                ...
            {
                ...
            }
        ],
        "multi_branches": false,
        "archived": false,        ,
        "user": "5def0f20a7c38e11f72d8b07",
        "date_created": "2019-12-10T03:21:05.006Z",
        "last_modified": "2019-12-10T03:21:05.006Z"
    }
}
 *  }
 *
 */
router.post('/create', acl('*'), userController.create);


/**
 * @api {get} /users/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get users collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup User
 *
 * @apiDescription Get a collection of users. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {String} username Username
 * @apiSuccess {Object} account Account detail Data
 * @apiSuccess {Boolean} status active/suspended
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 2,
      "total_docs_count": 14,
      "current_page": 1,
      "docs": [
         {
            "_id": "5def0f20a7c38e11f72d8b07",
            "realm": "user",
            "role": "Junior_Officer",
            "status": "active",
            "archived": false,    
            "username": "hassen@test",
            "created_by": "super@bidir.com",
            "date_created": "2019-12-10T03:21:04.999Z",
            "last_modified": "2019-12-10T03:21:05.018Z",
            "last_login": "2019-12-10T03:21:04.999Z",
            "account": {
               "_id": "5def0f21a7c38e5a2d2d8b08"
               ...
            }
         },
         {
            ...
         }           
      ]
   }
 */
router.get('/paginate', acl(['*']), userController.fetchAllByPagination);

/**
 * @api {get} /users/search?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Search users
 * @apiVersion 1.0.0
 * @apiName Search
 * @apiGroup User
 *
 * @apiDescription Get a collection of users by search. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 * 
 * @apiExample Usage Example
 * api.dev.bidir.gebeya.co/users/search?search=hassen
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {String} username Username
 * @apiSuccess {Object} account Account detail Data
 * @apiSuccess {Boolean} status active/suspended
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 * 
 * 
 * @apiSuccessExample Response Example:
 *  {
 *    {
 *    "total_pages": 1,
      "total_docs_count": 1,
      "current_page": 1,
      "docs": [
         {
            "_id": "5def0f20a7c38e11f72d8b07",
            "realm": "user",
            "role": "Junior_Officer",
            "status": "active",
            "archived": false,    
            "username": "hassen@test",
            "created_by": "super@bidir.com",
            "date_created": "2019-12-10T03:21:04.999Z",
            "last_modified": "2019-12-10T03:21:05.018Z",
            "last_login": "2019-12-10T03:21:04.999Z",
            "account": {
               "_id": "5def0f21a7c38e5a2d2d8b08"
               ...
            }
         },
         {
            ...
         }           
      ]
   }
 */
router.get('/search', acl(['*']), userController.search);


/**
 * @api {put} /users/:id/passwords Update User Password
 * @apiVersion 1.0.0
 * @apiName UpdatePassword
 * @apiGroup User 
 *
 * @apiDescription Update a User Password with the given id
 *
 * @apiParam {String} old_password Old Password
 * @apiParam {String} new_password New Password
 *
 * @apiParamExample Request example:
 * {
 *    old_password: "oldpassword",
 *    new_password: "newpassword"
 * }
 *
 * @apiSuccess {String} message Message
 *
 * @apiSuccessExample Response Example:
 *  {
 *    message : "Password Updated Successful"
 *  }
 */
router.put('/:id/passwords', acl(['*']), userController.updatePassword);


/**
 * @api {put} /users/:id/reset Resets User Password
 * @apiVersion 1.0.0
 * @apiName ResetPassword
 * @apiGroup User 
 *
 * @apiDescription Resets a User's Password with the given id to a a default password (which is pass2acat)
 * 
 *
 * @apiSuccess {String} message Message
 *
 * @apiSuccessExample Response Example:
 {
    "message": "Password reset operation Successful"
 }
 */
router.put('/:id/reset', acl(['*']), userController.resetPassword);


/**
 * @api {get} /users/:id Get User
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup User
 *
 * @apiDescription Get a user with the given id
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {String} username Username
 * @apiSuccess {Object} account Account detail Data
 * @apiSuccess {Boolean} status active/suspended
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
      "_id": "5def0f20a7c38e11f72d8b07",
      "realm": "user",
      "role": "Junior_Officer",
      "status": "active",
      "archived": false,    
      "username": "hassen@test",
      "created_by": "super@bidir.com",
      "date_created": "2019-12-10T03:21:04.999Z",
      "last_modified": "2019-12-10T03:21:05.018Z",
      "last_login": "2019-12-10T03:21:04.999Z",
      "account": {
         "_id": "5def0f21a7c38e5a2d2d8b08"
         ...
      }
   }     
     
 *  
 *
 */
router.get('/:id', acl(['*']), userController.fetchOne);


/**
 * @api {put} /users/:id Update User
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup User 
 *
 * @apiDescription Update a User user with the given id
 *
 * @apiParam {Object} Data Update data
 *
 * @apiParamExample Request example:
 * {
 *    username: "hassenM@test"
 * }
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {String} username Username
 * @apiSuccess {Object} account Account detail Data
 * @apiSuccess {Boolean} status active/suspended
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
      "_id": "5def0f20a7c38e11f72d8b07",
      "realm": "user",
      "role": "Junior_Officer",
      "status": "active",
      "archived": false,    
      "username": "hassenM@test",
      "created_by": "super@bidir.com",
      "date_created": "2019-12-10T03:21:04.999Z",
      "last_modified": "2019-12-10T03:21:05.018Z",
      "last_login": "2019-12-10T03:21:04.999Z",
      "account": {
         "_id": "5def0f21a7c38e5a2d2d8b08"
         ...
      }
   }     
 */
router.put('/:id', acl(['*']), userController.update);

/**
 * @api {delete} /users/:id Delete User
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup User 
 *
 * @apiDescription Delete a User user with the given id
 *
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {String} username Username
 * @apiSuccess {Object} account Account detail Data
 * @apiSuccess {Boolean} status active/suspended
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
      "_id": "5def0f20a7c38e11f72d8b07",
      "realm": "user",
      "role": "Junior_Officer",
      "status": "active",
      "archived": false,    
      "username": "hassenM@test",
      "created_by": "super@bidir.com",
      "date_created": "2019-12-10T03:21:04.999Z",
      "last_modified": "2019-12-10T03:21:05.018Z",
      "last_login": "2019-12-10T03:21:04.999Z",
      "account": {
         "_id": "5def0f21a7c38e5a2d2d8b08"
         ...
      }
   }  
 */
router.delete('/:id', acl(['*']), userController.remove);


// Expose User Router
module.exports = router;
