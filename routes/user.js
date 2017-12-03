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
 * @api {post} /users/create Create new User User
 * @apiVersion 1.0.0
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiDescription Create new User user
 *
 * @apiParam {String} username Email Address
 * @apiParam {String} password Account Password
 * @apiParam {String} first_name First Name
 * @apiParam {String} last_name Last Name
 * @apiParam {String} email Email Address
 * @apiParam {String} user_role Role name ie loan_officer
 * @apiParam {String} default_branch Default Branch for User
 * @apiParam {String} role References to Role asigned to user
 * @apiParam {Object} picture Account Picture _SUBMIT IN MULTIPART/FORM-DATA__
 *
 * @apiParamExample Request Example:
 *  {
 *    first_name: "Mary",
 *    last_name: "Jane",
 *    email: "mary.jane@gmail.com",
 *    username: "mary.jane@gmail.com",
 *    password: "password",
 *    user_role: "loan_officer",
 *    role : "556e1174a8952c9521286a60",
 *    default_branch : "556e1174a8952c9521286a60"
 *  }
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {Object} account Account Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    username: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "loan_officer",
 *    realm: "user",
 *    account: {
 *      _id : "556e1174a8952c9521286a60",
 *      user : "556e1174a8952c9521286a60",
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: "556e1174a8952c9521286a60",
 *      access_branches: [],
 *      role: 556e1174a8952c9521286a60,
 *      ...
 *    }
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
 * @apiSuccess {Object} account Account Data
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *    _id : "556e1174a8952c9521286a60"
 *    username: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "loan_officer",
 *    realm: "user",
 *    account: {
 *      _id : "556e1174a8952c9521286a60",
 *      user : "556e1174a8952c9521286a60",
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: "556e1174a8952c9521286a60",
 *      access_branches: [],
 *      roles: [556e1174a8952c9521286a60],
 *      ...
 *    }
 *    }]
 *  }
 */
router.get('/paginate', acl(['*']), userController.fetchAllByPagination);

/**
 * @api {get} /users/:id Get User User
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup User
 *
 * @apiDescription Get a user user with the given id
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {Object} account Account Data
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    username: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "loan_officer",
 *    realm: "user",
 *    account: {
 *      _id : "556e1174a8952c9521286a60",
 *      user : "556e1174a8952c9521286a60",
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: "556e1174a8952c9521286a60",
 *      access_branches: [],
 *      roles: [556e1174a8952c9521286a60],
 *      ...
 *    }
 *  }
 *
 */
router.get('/:id', acl(['*']), userController.fetchOne);


/**
 * @api {put} /users/:id Update User User
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
 *    notes: "FB"
 * }
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {Object} account Account Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    username: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "loan_officer",
 *    realm: "user",
 *    account: {
 *      _id : "556e1174a8952c9521286a60",
 *      user : "556e1174a8952c9521286a60",
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: "556e1174a8952c9521286a60",
 *      access_branches: [],
 *      roles: [556e1174a8952c9521286a60],
 *      ...
 *    }
 *  }
 */
router.put('/:id', acl(['*']), userController.update);

/**
 * @api {delete} /users/:id Delete User User
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup User 
 *
 * @apiDescription Delete a User user with the given id
 *
 *
 * @apiSuccess {String} _id user id
 * @apiSuccess {Object} account Account Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role User Role
 * @apiSuccess {String} realm User Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    username: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "loan_officer",
 *    realm: "user",
 *    account: {
 *      _id : "556e1174a8952c9521286a60",
 *      user : "556e1174a8952c9521286a60",
 *      first_name: "Mary",
 *      last_name: "Jane",
 *      email: "mary.jane@gmail.com",
 *      phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: "556e1174a8952c9521286a60",
 *      access_branches: [],
 *      roles: [556e1174a8952c9521286a60],
 *      ...
 *    }
 *  }
 */
router.delete('/:id', acl(['*']), userController.remove);


// Expose User Router
module.exports = router;
