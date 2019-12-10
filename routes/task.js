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
 * @apiSuccess {String} status Task Status ie pending, completed
 * @apiSuccess {String} user User Account for which the task is assigned
 * @apiSuccess {String} created_by Task Creator
 * @apiSuccess {String} comment Comment
 * @apiSuccess {String} branch Branch Id
 * 
 *
 * @apiSuccessExample Response Example:
    {
        "total_pages": 1,
        "total_docs_count": 4,
        "current_page": 1,
        "docs": [
            {
                "user": null,
                "status": "pending",
                "comment": "",
                "_id": "5dd613539704b70001458148",
                "last_modified": "2019-11-21T04:32:19.292Z",
                "date_created": "2019-11-21T04:32:19.292Z",
                "task": "Approve Client ACAT of Lemecha Jarso",
                "task_type": "approve",
                "entity_ref": "5bbe0882760f80000195968a",
                "entity_type": "clientACAT",
                "created_by": "5b926ea8e1d5e7000177b3f5",
                "branch": "5b926c849fb7f20001f1494c"
            },
            {
                ...
            }
        ]
    }
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
 * @apiSuccess {String} status Task Status ie pending, completed
 * @apiSuccess {String} user User Account for which the task is assigned
 * @apiSuccess {String} created_by Task Creator
 * @apiSuccess {String} comment Comment
 * @apiSuccess {String} branch Branch Id
 *
 * @apiSuccessExample Response Example:
    {
        "user": null,
        "status": "pending",
        "comment": "",
        "_id": "5dd613539704b70001458148",
        "last_modified": "2019-11-21T04:32:19.292Z",
        "date_created": "2019-11-21T04:32:19.292Z",
        "task": "Approve Client ACAT of Lemecha Jarso",
        "task_type": "approve",
        "entity_ref": "5bbe0882760f80000195968a",
        "entity_type": "clientACAT",
        "created_by": "5b926ea8e1d5e7000177b3f5",
        "branch": "5b926c849fb7f20001f1494c"
    }
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
 * @apiParam {String} status Status value to update
 * @apiParam {String} comment Comment for action
 *
 * @apiParamExample Request example:
 * {
 *    status: "completed",
 *    comment: "Comment for task"
 * }
 *
 * @apiSuccess {String} _id task id
 * @apiSuccess {String} entity_type Account or Branch Associated with task
 * @apiSuccess {String} entity_ref Account or Branch Ref Id
 * @apiSuccess {String} task Task Description
 * @apiSuccess {Array} task_type Task Type
 * @apiSuccess {String} status Task Status ie pending, completed
 * @apiSuccess {String} user User Account for which the task is assigned
 * @apiSuccess {String} created_by Task Creator
 * @apiSuccess {String} comment Comment
 * @apiSuccess {String} branch Branch Id
 *
 * @apiSuccessExample Response Example:
    {
        "user": null,
        "status": "completed",
        "comment": "Comment for task",
        "_id": "5dd613539704b70001458148",
        "last_modified": "2019-11-21T04:32:19.292Z",
        "date_created": "2019-11-21T04:32:19.292Z",
        "task": "Approve Client ACAT of Lemecha Jarso",
        "task_type": "approve",
        "entity_ref": "5bbe0882760f80000195968a",
        "entity_type": "clientACAT",
        "created_by": "5b926ea8e1d5e7000177b3f5",
        "branch": "5b926c849fb7f20001f1494c"
    }
 */
router.put('/:id/status', acl(['*']), taskController.updateStatus);

// Expose Task Router
module.exports = router;
