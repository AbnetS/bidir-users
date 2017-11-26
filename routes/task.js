'use strict';
/**
 * Load Module Dependencies.
 */
const Router  = require('koa-router');
const debug   = require('debug')('api:task-router');

const taskController  = require('../controllers/task');
const authController     = require('../controllers/auth');

const acl               = authController.accessControl;
var router  = Router();

/**
 * @api {get} /users/tasks/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get tasks collection
 * @apiVersion 1.0.0
 * @apiName FetchPaginated
 * @apiGroup Task
 *
 * @apiDescription Get a collection of tasks. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id task id
 * @apiSuccess {String} entity_type Account or Branch Associated with task
 * @apiSuccess {String} entity_ref Account or Branch Ref Id
 * @apiSuccess {String} task Task Description
 * @apiSuccess {Array} task_type Task Type
 * @apiSuccess {String} status Task Status ie pending, cancelled or approved
 * @apiSuccess {String} [account] Account Assigned task
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *    	_id : "556e1174a8952c9521286a60",
 *    	task: "Account Approval for new account of John Doe",
 *    	task_type: "account_creation_approval",
 *    	status: "approved",
 *      entity_type: "account",
 *    	entity_ref : "556e1174a8952c9521286a60",
 *      account: null
 *    }]
 *  }
 */
router.get('/paginate', acl(['*']), taskController.fetchAllByPagination);

/**
 * @api {get} /users/tasks/:id Get Task
 * @apiVersion 1.0.0
 * @apiName GetTask
 * @apiGroup Task
 *
 * @apiDescription Get a task with the given id
 *
 * @apiSuccess {String} _id task id
 * @apiSuccess {String} entity_type Account or Branch Associated with task
 * @apiSuccess {String} entity_ref Account or Branch Ref Id
 * @apiSuccess {String} task Task Description
 * @apiSuccess {Array} task_type Task Type
 * @apiSuccess {String} status Task Status ie pending, cancelled or approved
 * @apiSuccess {String} [account] Account Assigned task
 *
 * @apiSuccessExample Response Example:
 *  {
  *    _id : "556e1174a8952c9521286a60",
 *    task: "Account Approval for new account of John Doe",
 *    task_type: "account_creation_approval",
 *    status: "approved",
 *    entity_type: "account",
 *    entity_ref : "556e1174a8952c9521286a60",
 *    account : "556e1174a8952c9521286a60",
 *  }
 *
 */
router.get('/:id', acl(['*']), taskController.fetchOne);


/**
 * @api {put} /users/tasks/:id/status Update Task Status
 * @apiVersion 1.0.0
 * @apiName UpdateTaskStatus
 * @apiGroup Task 
 *
 * @apiDescription Update a task status with the given id
 *
 * @apiParam {String} status Update Status ie cancelled, approved or pending
 *
 * @apiParamExample Request example:
 * {
 *    status: "approved"
 * }
 *
 * @apiSuccess {String} _id task id
 * @apiSuccess {String} entity_type Account or Branch Associated with task
 * @apiSuccess {String} entity_ref Account or Branch Ref Id
 * @apiSuccess {String} task Task Description
 * @apiSuccess {Array} task_type Task Type
 * @apiSuccess {String} status Task Status ie pending, cancelled or approved
 * @apiSuccess {String} [account] Account Assigned task
 *
 * @apiSuccessExample Response Example:
 *  {
 *    	_id : "556e1174a8952c9521286a60",
 *    task: "Account Approval for new account of John Doe",
 *    task_type: "account_creation_approval",
 *    status: "approved",
 *    entity_type: "account",
 *    entity_ref : "556e1174a8952c9521286a60",
 *    account : "556e1174a8952c9521286a60",
 *  }
 */
router.put('/:id/status', acl(['*']), taskController.updateStatus);

// Expose Task Router
module.exports = router;
