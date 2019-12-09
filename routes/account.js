'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:account-router');

const accountController  = require('../controllers/account');
const authController     = require('../controllers/auth');

const acl               = authController.accessControl;
var router  = Router();

/**
 * @api {get} /users/accounts/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get accounts collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup Account
 *
 * @apiDescription Get a collection of accounts. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id account id
 * @apiSuccess {Object} user User Data Object
 * @apiSuccess {String} picture Picture URL
 * @apiSuccess {String} first_name First name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} grandfather_name Grandfather name
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Date} hired_date Date on which the user is hired
 * @apiSuccess {Boolean} multi_branches Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 * @apiSuccess {String} title Account Title
 *
 * @apiSuccessExample Response Example:
 *  {
    "total_pages": 2,
    "total_docs_count": 11,
    "current_page": 1,
    "docs": [
        {
            "_id": "5de1039631a5ca2fce7c4a10",
            "picture": "",
            "title": "Mr",
            "gender": "SELECT",
            "first_name": "Tester",
            "last_name": "User",
            "email": "",
            "phone": "",
            "city": "SELECT",
            "country": "SELECT",
            "hired_date": "2019-11-11T21:00:00.000Z",
            "grandfather_name": "Test",
            "role": {
                "permissions": [
                    {
                        "description": "Create a given group",
                        "_id": "5c597f8db711700001a016d5",
                        ...
                    },
                    {
                        ...
                    }
                ],
                "_id": "5b9259c8b1cfc10001d80927",
                "name": "Senior Officer"
            },
            "default_branch": "5b9283679fb7f20001f1494d",
            "access_branches": [
                "5b9283679fb7f20001f1494d"
            ],
            "multi_branches": false,
            "archived": false,            
            "user": {
                "realm": "user",
                "role": "Senior_Officer",
                "status": "active",
                "archived": false,
                "_id": "5de1039631a5ca506f7c4a0f",
                "username": "tester",
                "created_by": "super@bidir.com",
                "date_created": "2019-11-29T11:40:06.314Z",
                "last_modified": "2019-11-29T11:40:06.335Z",
                "last_login": "2019-11-29T11:40:06.314Z",
                "account": "5de1039631a5ca2fce7c4a10"
            },
            "date_created": "2019-11-29T11:40:06.322Z",
            "last_modified": "2019-11-29T11:40:06.322Z"
        },
        {
            ...
        }
 */
router.get('/paginate', acl(['*']), accountController.fetchAllByPagination);

/**
 * @api {get} /users/accounts/search?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Search accounts
 * @apiVersion 1.0.0
 * @apiName Search
 * @apiGroup Account
 *
 * @apiDescription Get a collection of accounts. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 * 
 * @apiExample Example usage
 * api.test.bidir.gebeya.co/accounts/search?search=tessema
 * 
 *
 * @apiSuccess {String} _id account id
 * @apiSuccess {Object} user User Data Object
 * @apiSuccess {String} picture Picture URL
 * @apiSuccess {String} first_name First name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} grandfather_name Grandfather name
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Date} hired_date Date on which the user is hired
 * @apiSuccess {Boolean} multi_branches Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 * @apiSuccess {String} title Account Title
 *
 * @apiSuccessExample Response Example:
 *  {
    "total_pages": 1,
    "total_docs_count": 1,
    "current_page": 1,
    "docs": [
        {
            "picture": "http://api.dev.bidir.gebeya.co/assets/ABEBE_6a9f05eebce7.png",
            "title": "Loan Officer",
            "gender": "female",
            "first_name": "Abebe",
            "last_name": "Tessema",
            "email": "assefa@gmail.com",
            "phone": "0912636363",
            "city": "Addis Ababa",
            "country": "Ethiopia",
            "hired_date": "2017-02-07T21:00:00.000Z",
            "grandfather_name": "Officer",
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
                "_id": "5b9259c8b1cfc10001d80927",
                "name": "Senior Officer"
            },
            "default_branch": "5b9283679fb7f20001f1494d",
            "access_branches": [
                "5b9283679fb7f20001f1494d"
            ],
            "multi_branches": false,
            "archived": false,
            "_id": "5dde8858ce0f6c672885c125",
            "user": {
                "realm": "user",
                "role": "Senior_Officer",
                "status": "active",
                "archived": false,
                "_id": "5dde8857ce0f6c672885c124",
                "username": "senior@meki",
                "created_by": "super@bidir.com",
                "date_created": "2019-11-27T14:29:44.361Z",
                "last_modified": "2019-12-09T15:30:13.585Z",
                "last_login": "2019-12-09T15:30:13.585Z",
                "account": "5dde8858ce0f6c672885c125"
            },
            "date_created": "2019-11-27T14:29:44.405Z",
            "last_modified": "2019-12-09T15:43:08.055Z"
        }
    ]
}
 */
router.get('/search', acl(['*']), accountController.search);


/**
 * @api {get} /users/accounts/:id Get Account
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup Account
 *
 * @apiDescription Get a user account with the given id
 *
 * @apiSuccess {String} _id account id
 * @apiSuccess {Object} user User Data Object
 * @apiSuccess {String} picture Picture URL
 * @apiSuccess {String} first_name First name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} grandfather_name Grandfather name
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Date} hired_date Date on which the user is hired
 * @apiSuccess {Boolean} multi_branches Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 * @apiSuccess {String} title Account Title
 *
 * @apiSuccessExample Response Example:
 {
            "_id": "5de1039631a5ca2fce7c4a10",
            "picture": "",
            "title": "Mr",
            "gender": "SELECT",
            "first_name": "Tester",
            "last_name": "User",
            "email": "",
            "phone": "",
            "city": "SELECT",
            "country": "SELECT",
            "hired_date": "2019-11-11T21:00:00.000Z",
            "grandfather_name": "Test",
            "role": {
                "permissions": [
                    {
                        "description": "Create a given group",
                        "_id": "5c597f8db711700001a016d5",
                        ...
                    },
                    {
                        ...
                    }
                ],
                "_id": "5b9259c8b1cfc10001d80927",
                "name": "Senior Officer"
            },
            "default_branch": "5b9283679fb7f20001f1494d",
            "access_branches": [
                "5b9283679fb7f20001f1494d"
            ],
            "multi_branches": false,
            "archived": false,            
            "user": {
                "realm": "user",
                "role": "Senior_Officer",
                "status": "active",
                "archived": false,
                "_id": "5de1039631a5ca506f7c4a0f",
                "username": "tester",
                "created_by": "super@bidir.com",
                "date_created": "2019-11-29T11:40:06.314Z",
                "last_modified": "2019-11-29T11:40:06.335Z",
                "last_login": "2019-11-29T11:40:06.314Z",
                "account": "5de1039631a5ca2fce7c4a10"
            },
            "date_created": "2019-11-29T11:40:06.322Z",
            "last_modified": "2019-11-29T11:40:06.322Z"
        }
    }
 *
 */
router.get('/:id', acl(['*']), accountController.fetchOne);


/**
 * @api {put} /users/accounts/:id Update Account
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup Account 
 *
 * @apiDescription Update an account with the given id
 *
 * @apiParam {Object} Data Update data
 *
 * @apiParamExample Request example:
 * {
 *    title: "Mrs."
 * }
 *
* @apiSuccess {String} _id account id
 * @apiSuccess {Object} user User Data Object
 * @apiSuccess {String} picture Picture URL
 * @apiSuccess {String} first_name First name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} grandfather_name Grandfather name
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Date} hired_date Date on which the user is hired
 * @apiSuccess {Boolean} multi_branches Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 * @apiSuccess {String} title Account Title
 *
 * @apiSuccessExample Response Example:
 *  {
            "_id": "5de1039631a5ca2fce7c4a10",
            "picture": "",
            "title": "Mrs.",
            "gender": "SELECT",
            "first_name": "Test",
            "last_name": "User",
            "email": "",
            "phone": "",
            "city": "SELECT",
            "country": "SELECT",
            "hired_date": "2019-11-11T21:00:00.000Z",
            "grandfather_name": "Test",
            "role": {
                "permissions": [
                    {
                        "description": "Create a given group",
                        "_id": "5c597f8db711700001a016d5",
                        ...
                    },
                    {
                        ...
                    }
                ],
                "_id": "5b9259c8b1cfc10001d80927",
                "name": "Senior Officer"
            },
            "default_branch": "5b9283679fb7f20001f1494d",
            "access_branches": [
                "5b9283679fb7f20001f1494d"
            ],
            "multi_branches": false,
            "archived": false,            
            "user": {
                "realm": "user",
                "role": "Senior_Officer",
                "status": "active",
                "archived": false,
                "_id": "5de1039631a5ca506f7c4a0f",
                "username": "tester",
                "created_by": "super@bidir.com",
                "date_created": "2019-11-29T11:40:06.314Z",
                "last_modified": "2019-11-29T11:40:06.335Z",
                "last_login": "2019-11-29T11:40:06.314Z",
                "account": "5de1039631a5ca2fce7c4a10"
            },
            "date_created": "2019-11-29T11:40:06.322Z",
            "last_modified": "2019-11-29T11:40:06.322Z"
        }
    }
 */
router.put('/:id', acl(['*']), accountController.update);


/**
 * @api {put} /users/accounts/:id/profile Update Profile
 * @apiVersion 1.0.0
 * @apiName UpdateProfile
 * @apiGroup Account 
 *
 * @apiDescription Update the profile of the account/user. A user can update only his/her
 * own profile. This endpoint is different from UpdateAccount in that regard.
 *
 * @apiParam {Object} Data Updated data. Data to be submitted as multipart/form-data
 *
 * @apiParamExample Request example:
 * {
    "email": "tufa@gmail.com",
    "city":"Addis Ababa",
    "country":"Ethiopia" 
    }
 *
 * @apiSuccess {String} _id account id
 * @apiSuccess {Object} user User Data Object
 * @apiSuccess {String} picture Picture URL
 * @apiSuccess {String} first_name First name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} grandfather_name Grandfather name
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Date} hired_date Date on which the user is hired
 * @apiSuccess {Boolean} multi_branches Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 * @apiSuccess {String} title Account Title
 *
 * @apiSuccessExample Response Example:
 *  *  {
            "_id": "5de1039631a5ca2fce7c4a10",
            "picture": "",
            "title": "Mrs.",
            "gender": "SELECT",
            "first_name": "Test",
            "last_name": "User",
            "email": "tufa@gmail.com",
            "phone": "",
            "city": "Addis Ababa",
            "country": "Ethiopia",
            "hired_date": "2019-11-11T21:00:00.000Z",
            "grandfather_name": "Test",
            "role": {
                "permissions": [
                    {
                        "description": "Create a given group",
                        "_id": "5c597f8db711700001a016d5",
                        ...
                    },
                    {
                        ...
                    }
                ],
                "_id": "5b9259c8b1cfc10001d80927",
                "name": "Senior Officer"
            },
            "default_branch": "5b9283679fb7f20001f1494d",
            "access_branches": [
                "5b9283679fb7f20001f1494d"
            ],
            "multi_branches": false,
            "archived": false,            
            "user": {
                "realm": "user",
                "role": "Senior_Officer",
                "status": "active",
                "archived": false,
                "_id": "5de1039631a5ca506f7c4a0f",
                "username": "tester",
                "created_by": "super@bidir.com",
                "date_created": "2019-11-29T11:40:06.314Z",
                "last_modified": "2019-11-29T11:40:06.335Z",
                "last_login": "2019-11-29T11:40:06.314Z",
                "account": "5de1039631a5ca2fce7c4a10"
            },
            "date_created": "2019-11-29T11:40:06.322Z",
            "last_modified": "2019-11-29T11:40:06.322Z"
        }
    }
 */
router.put('/:id/profile', acl(['*']), accountController.updateProfile);



router.put('/:id/pictures', acl(['*']), accountController.updatePhoto);



// Expose Account Router
module.exports = router;
