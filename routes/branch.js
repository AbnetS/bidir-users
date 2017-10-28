/**
 * branch router.
 *
 * @summary
 *  branch.create()
 *  branch.update()
 *  branch.delete()
 *  branch.fetchOne()
 *  branch.fetchAll()
 */

/**
 * Load Module Dependencies.
 */
var express  = require('express');
var debug    = require('debug')('api:branch-router');

var branchController = require('../controllers/branch');
var accessControl  = require('../controllers/access-control').accessControl;

var branchRouter  = express.Router();

/**
 * @api {post} /branches/register Register branch
 * @apiVersion 1.0.0
 * @apiName Create
 * @apiGroup branch
 *
 * @apiDescription Create a new branch.
 *
 * @apiParam {String} name of the branch
 *
 * @apiParamExample Request Example:
 *  {
 *    "name": "Jumia Online Shop"
 *  }
 *
 * @apiSuccess {String} _id branch id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
branchRouter.post('/register', branchController.create);

/**
 * @api {get} /branchs/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get branchs collection
 * @apiVersion 1.0.0
 * @apiName FetchAllByPagination
 * @apiGroup branch
 *
 * @apiDescription Get a collection of branchs. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id branch id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "total_pages": 1,
 *    "total_docs_count": 0,
 *    "docs": [{
 *      "_id" : "556e1174a8952c9521286a60"
 *    }]
 *  }
 *
 */
branchRouter.get('/paginate'/*, accessControl('admin')*/, branchController.fetchAllByPagination);

branchRouter.get('/search'/*, accessControl('admin')*/, branchController.search);


/**
 * @api {get} /branchs/:id Get branch
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup branch
 *
 * @apiDescription Get a branch with the given id
 *
 */
branchRouter.param('id', branchController.validateBranchId);
branchRouter.get('/:id'/*, accessControl(['branch', 'admin'])*/, branchController.fetchOne);

/**
 * @api {put} /branchs/:id Update branch
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup branch
 *
 * @apiDescription Update a branch with the given id
 *
 * @apiSuccess {String} _id branch id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
branchRouter.put('/:id', /*accessControl(['branch', 'admin']),*/ branchController.update);

branchRouter.put('/:id/deactivate', /*accessControl(['branch', 'admin']),*/ branchController.deactivate);

branchRouter.put('/:id/activate', /*accessControl(['branch', 'admin']),*/ branchController.activate);





/**
 * @api {get} /branchs Get branchs collection
 * @apiVersion 1.0.0
 * @apiName FetchAll
 * @apiGroup branch
 *
 * @apiDescription Get a collection of branchs.
 *
 * @apiSuccess {String} _id branch id
 *
 * @apiSuccessExample Response Example:
 *  [{
 *      "_id" : "556e1174a8952c9521286a60"
 *  }]
 *
 */
branchRouter.get('/', /*accessControl('admin'),*/ branchController.fetchAll);

/**
 * @api {delete} /branchs/:id Delete branch
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup branch
 *
 * @apiDescription Delete a branch with the given id
 *
 * @apiSuccess {String} _id branch id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
branchRouter.delete('/:id'/*, accessControl('admin')*/, branchController.delete);

// Expose branch branchr
module.exports = branchRouter;
