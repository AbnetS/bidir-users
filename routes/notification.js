'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:notification-router');

const notificationController  = require('../controllers/notification');
const authController     = require('../controllers/auth');

const acl               = authController.accessControl;
var router  = Router();

/**
 * @api {get} /users/notifications/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get notifications collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup Notification
 *
 * @apiDescription Get a collection of notifications. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id notification id
 * @apiSuccess {String} entity_type Account or Branch Associated with notification
 * @apiSuccess {String} entity_ref Account or Branch Ref Id
 * @apiSuccess {String} notification Notification Description
 * @apiSuccess {Array} notification_type Notification Type
 * @apiSuccess {String} status Notification Status ie pending, cancelled or approved
 * @apiSuccess {String} [account] Account Assigned notification
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *    	_id : "556e1174a8952c9521286a60",
 *    	notification: "Account Approval for new account of John Doe",
 *    	notification_type: "account_creation_approval",
 *    	status: "approved",
 *      entity_type: "account",
 *    	entity_ref : "556e1174a8952c9521286a60",
 *      account: null
 *    }]
 *  }
 */
router.get('/paginate', acl(['*']), notificationController.fetchAllByPagination);

/**
 * @api {get} /users/notifications/:id Get Notification
 * @apiVersion 1.0.0
 * @apiName GetNotification
 * @apiGroup Notification
 *
 * @apiDescription Get a notification with the given id
 *
 * @apiSuccess {String} _id notification id
 * @apiSuccess {String} entity_type Account or Branch Associated with notification
 * @apiSuccess {String} entity_ref Account or Branch Ref Id
 * @apiSuccess {String} notification Notification Description
 * @apiSuccess {Array} notification_type Notification Type
 * @apiSuccess {String} status Notification Status ie pending, cancelled or approved
 * @apiSuccess {String} [account] Account Assigned notification
 *
 * @apiSuccessExample Response Example:
 *  {
  *    _id : "556e1174a8952c9521286a60",
 *    notification: "Account Approval for new account of John Doe",
 *    notification_type: "account_creation_approval",
 *    status: "approved",
 *    entity_type: "account",
 *    entity_ref : "556e1174a8952c9521286a60",
 *    account : "556e1174a8952c9521286a60",
 *  }
 *
 */
router.get('/:id', acl(['*']), notificationController.fetchOne);


// Expose Notification Router
module.exports = router;
