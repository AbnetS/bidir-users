/**
 * MFI MFIr.
 *
 * @summary
 *  MFI.create()
 *  MFI.update()
 *  MFI.delete()
 *  MFI.fetchOne()
 *  MFI.fetchAll()
 */

/**
 * Load Module Dependencies.
 */
var express  = require('express');
var debug    = require('debug')('api:MFI-Router');
var multer   = require('multer')

var MFIController = require('../controllers/MFI');
var accessControl  = require('../controllers/access-control').accessControl;

var MFIRouter  = express.Router();

/**
 * @api {post} /MFIs/register Register MFI
 * @apiVersion 1.0.0
 * @apiName Create
 * @apiGroup MFI
 *
 * @apiDescription Create a new MFI.
 *
 * @apiParam {String} name of the MFI
 *
 * @apiParamExample Request Example:
 *  {
 *    "name": "Jumia Online Shop"
 *  }
 *
 * @apiSuccess {String} _id MFI id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
MFIRouter.post('/register', MFIController.create);

/**
 * @api {get} /MFIs/paginate?page=<RESULTS_PAGE>&per_page=<RESULTS_PER_PAGE> Get MFIs collection
 * @apiVersion 1.0.0
 * @apiName FetchAllByPagination
 * @apiGroup MFI
 *
 * @apiDescription Get a collection of MFIs. The endpoint has pagination
 * out of the box. Use these params to query with pagination: `page=<RESULTS_PAGE`
 * and `per_page=<RESULTS_PER_PAGE>`.
 *
 * @apiSuccess {String} _id MFI id
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
MFIRouter.get('/paginate'/*, accessControl('admin')*/, MFIController.fetchAllByPagination);


/**
 * @api {get} /MFIs/:id Get MFI
 * @apiVersion 1.0.0
 * @apiName Get
 * @apiGroup MFI
 *
 * @apiDescription Get a MFI with the given id
 *
 */
MFIRouter.param('id', MFIController.validateMFIId);
MFIRouter.get('/:id'/*, accessControl(['MFI', 'admin'])*/, MFIController.fetchOne);

/**
 * @api {put} /MFIs/:id Update MFI
 * @apiVersion 1.0.0
 * @apiName Update
 * @apiGroup MFI
 *
 * @apiDescription Update a MFI with the given id
 *
 * @apiSuccess {String} _id MFI id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
MFIRouter.put('/:id', /*accessControl(['MFI', 'admin']),*/ MFIController.update);



/**
 * @api {get} /MFIs Get MFIs collection
 * @apiVersion 1.0.0
 * @apiName FetchAll
 * @apiGroup MFI
 *
 * @apiDescription Get a collection of MFIs.
 *
 * @apiSuccess {String} _id MFI id
 *
 * @apiSuccessExample Response Example:
 *  [{
 *      "_id" : "556e1174a8952c9521286a60"
 *  }]
 *
 */
MFIRouter.get('/', /*accessControl('admin'),*/ MFIController.fetchAll);

/**
 * @api {delete} /MFIs/:id Delete MFI
 * @apiVersion 1.0.0
 * @apiName Delete
 * @apiGroup MFI
 *
 * @apiDescription Delete a MFI with the given id
 *
 * @apiSuccess {String} _id MFI id
 *
 * @apiSuccessExample Response Example:
 *  {
 *    "_id" : "556e1174a8952c9521286a60"
 *  }
 *
 */
MFIRouter.delete('/:id'/*, accessControl('admin')*/, MFIController.delete);

// Expose MFI MFIr
module.exports = MFIRouter;
