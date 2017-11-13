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
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Boolean} multi_branch Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *      _id : "556e1174a8952c9521286a60",
 *      user : {
 *	       _id : "556e1174a8952c9521286a60",
 *         ...
 *      },
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: {
 *	        _id : "556e1174a8952c9521286a60",
 *          ...
 *      },
 *      access_branches: [],
 *      role: {
 *			_id : "556e1174a8952c9521286a60",
 *          ...
 *      },
 *    }]
 *  }
 */
router.get('/paginate', acl(['*']), accountController.fetchAllByPagination);

/**
 * @api {get} /users/accounts/:id Get Account Account
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
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Boolean} multi_branch Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 *
 * @apiSuccessExample Response Example:
 *  {
 *      _id : "556e1174a8952c9521286a60",
 *      user : {
 *	       _id : "556e1174a8952c9521286a60",
 *         ...
 *      },
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: {
 *	        _id : "556e1174a8952c9521286a60",
 *          ...
 *      },
 *      access_branches: [],
 *      role: {
 *			_id : "556e1174a8952c9521286a60",
 *          ...
 *      },
 *  }
 *
 */
router.get('/:id', acl(['*']), accountController.fetchOne);


/**
 * @api {put} /users/accounts/:id Update Account Account
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup Account 
 *
 * @apiDescription Update a Account account with the given id
 *
 * @apiParam {Object} Data Update data
 *
 * @apiParamExample Request example:
 * {
 *    notes: "FB"
 * }
 *
 * @apiSuccess {String} _id account id
 * @apiSuccess {Object} user User Data Object
 * @apiSuccess {String} picture Picture URL
 * @apiSuccess {String} first_name First name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} email Email Address
 * @apiSuccess {String} phone Phone Number
 * @apiSuccess {String} gender Gender "Male" or "Female"
 * @apiSuccess {Boolean} multi_branch Multiple Branches 
 * @apiSuccess {Object} default_branch Default Branch
 * @apisuccess {Array} access_branches Accessible Branches for the Account
 * @apiSuccess {Object} role Role for the Account with Permissions
 *
 * @apiSuccessExample Response Example:
 *  {
 *      _id : "556e1174a8952c9521286a60",
 *      user : {
 *	       _id : "556e1174a8952c9521286a60",
 *         ...
 *      },
 *    	first_name: "Mary",
 *    	last_name: "Jane",
 *    	email: "mary.jane@gmail.com",
 *    	phone: "095342345",
 *      picture: "https://mfi.com/assets/account_5736573.png",
 *      gender: "SELECT",
 *      multi_branch: false,
 *      default_branch: {
 *	        _id : "556e1174a8952c9521286a60",
 *          ...
 *      },
 *      access_branches: [],
 *      role: {
 *			_id : "556e1174a8952c9521286a60",
 *          ...
 *      }
 *  }
 */
router.put('/:id', acl(['*']), accountController.update);

// Expose Account Router
module.exports = router;
