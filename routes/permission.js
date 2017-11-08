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
 * @apiParam {String} signup_type Signup type either social or basic or anon
 * @apiParam {String} picture Profile Picture image
 * @apiParam {String} full_name Full Names
 * @apiParam {String} [email] Email Address
 * @apiParam {String} [phone] Phone Number
 * @apiParam {String} permissionname Permissionname either the phone_number or email, if Anonymous, app should create a unique one
 * @apiParam {String} [password] Password
 * @apiParam {String} [age] Age
 * @apiParam {String} [city] City
 * @apiParam {String} [Country] Country
 * @apiParam {String} gender Male or Female
 * @apiParam {String} [facebook] Facebook Link
 * @apiParam {String} [google] Instagram Link
 *
 * @apiParamExample Request Example:
 *  {
 *    picture: "https://fb.cdn.ugusgu.us./permission/285475474224/profile.png",
 *    full_name: "Mary Jane",
 *    email: "mary.jane@gmail.com",
 *    permissionname: "mary.jane@gmail.com",
 *    city: "Nairobi",
 *    country: "Kenya",
 *    gender: "Female",
 *    facebook: "https://facebook.com/permissions/mary.jane",
 *    signup_type: "social"
 *  }
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {Object} player Player Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role Permission Role
 * @apiSuccess {String} realm Permission Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    is_active: true,
 *    permissionname: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "player",
 *    realm: "permission",
 *    player: {
 *      _id : "556e1174a8952c9521286a60",
 *      permission : "556e1174a8952c9521286a60",
 *      device : "556e1174a8952c9521286a60",
 *      preferences : "556e1174a8952c9521286a60",
 *      score_board : "556e1174a8952c9521286a60",
 *      friends : "556e1174a8952c9521286a60",
 *      facebook: "https://facebook.com/permissions/mary.jane"
 *      full_name: "Mary Jane",
 *      phone: "",
 *      country: "Kenya",
 *      city: "Nairobi",
 *      email: "mary.jane@gmail.com",
 *      ...
 *    }
 *  }
 *
 */
router.post('/create',  permissionController.create);


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
 * @apiSuccess {Object} player Player Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role Permission Role
 * @apiSuccess {String} realm Permission Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *      _id : "556e1174a8952c9521286a60"
 *      is_active: true,
 *      permissionname: "mary.jane@gmail.com",
 *      last_login: '2017-03-16T10:50:52.305Z',
 *      role: "player",
 *      realm: "permission",
 *      player: {
 *        _id : "556e1174a8952c9521286a60",
 *        permission : "556e1174a8952c9521286a60",
 *        device : "556e1174a8952c9521286a60",
 *        preferences : "556e1174a8952c9521286a60",
 *        score_board : "556e1174a8952c9521286a60",
 *        friends : "556e1174a8952c9521286a60",
 *        facebook: "https://facebook.com/permissions/mary.jane"
 *        full_name: "Mary Jane",
 *        phone: "",
 *        country: "Kenya",
 *        city: "Nairobi",
 *        email: "mary.jane@gmail.com",
 *        ...
 *      }
 *    }]
 *  }
 */
router.get('/paginate', acl(['admin']), permissionController.fetchAllByPagination);

/**
 * @api {get} /users/permissions/:id Get Permission
 * @apiVersion 1.0.0
 * @apiName GetPermission
 * @apiGroup Permission
 *
 * @apiDescription Get a permission with the given id
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {Object} player Player Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role Permission Role
 * @apiSuccess {String} realm Permission Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    is_active: true,
 *    permissionname: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "player",
 *    realm: "permission",
 *    player: {
 *      _id : "556e1174a8952c9521286a60",
 *      permission : "556e1174a8952c9521286a60",
 *      device : "556e1174a8952c9521286a60",
 *      preferences : "556e1174a8952c9521286a60",
 *      score_board : "556e1174a8952c9521286a60",
 *      friends : "556e1174a8952c9521286a60",
 *      facebook: "https://facebook.com/permissions/mary.jane"
 *      full_name: "Mary Jane",
 *      phone: "",
 *      country: "Kenya",
 *      city: "Nairobi",
 *      email: "mary.jane@gmail.com",
 *      ...
 *    }
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
 *    notes: "FB"
 * }
 *
 * @apiSuccess {String} _id permission id
 * @apiSuccess {Object} player Player Data
 * @apiSuccess {Boolean} is_active Activeness
 * @apiSuccess {String} role Permission Role
 * @apiSuccess {String} realm Permission Realm
 * @apiSuccess {String} last_login Last Login Time Stamp
 *
 * @apiSuccessExample Response Example:
 *  {
 *    _id : "556e1174a8952c9521286a60"
 *    is_active: true,
 *    permissionname: "mary.jane@gmail.com",
 *    last_login: '2017-03-16T10:50:52.305Z',
 *    role: "player",
 *    realm: "permission",
 *    player: {
 *      _id : "556e1174a8952c9521286a60",
 *      permission : "556e1174a8952c9521286a60",
 *      device : "556e1174a8952c9521286a60",
 *      preferences : "556e1174a8952c9521286a60",
 *      score_board : "556e1174a8952c9521286a60",
 *      friends : "556e1174a8952c9521286a60",
 *      facebook: "https://facebook.com/permissions/mary.jane"
 *      full_name: "Mary Jane",
 *      phone: "",
 *      country: "Kenya",
 *      city: "Nairobi",
 *      email: "mary.jane@gmail.com",
 *      ...
 *    }
 *  }
 */
router.put('/:id', acl(['*']), permissionController.update);

// Expose Permission Router
module.exports = router;
