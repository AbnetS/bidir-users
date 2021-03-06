'use strict';
// Access Layer for Token Data.

/**
 * Load Module Dependencies.
 */
const debug   = require('debug')('api:dal-token');
const moment  = require('moment');
const _       = require('lodash');
const co      = require('co');

const Token       = require('../models/token');
const User        = require('../models/user');
const mongoUpdate = require('../lib/mongo-update');

const returnFields = Token.attributes;

var population = [{
  path: 'user',
  select: User.attributes
}];

/**
 * create a new token.
 *
 * @desc  creates a new token and saves them
 *        in the database
 *
 * @param {Object}  tokenData  Data for the token to create
 */
exports.create = function create(tokenData) {
  debug('creating a new token');

  return co(function* () {
    let searchQuery = { user: tokenData.user };
    let isPresent = yield Token.findOne(searchQuery);

    if(isPresent) {
      let query = { _id: isPresent._id };
      isPresent = yield exports.get(query);

      return isPresent;

    }

    let newToken = new Token(tokenData);
    let token = yield newToken.save();

    token = yield exports.get({ _id: token._id});


    return token;

  });

};

/**
 * delete a token
 *
 * @desc  delete data of the token with the given
 *        id
 *
 * @param {Object} query  Query Object
 */
exports.delete = function deleteItem(query) {
  debug(`deleting token: ${query}`);

  return co(function* () {
    let token = yield exports.get(query);
    let _empty = {};

    if(!token) {
      return _empty;
    } else {
      yield token.remove();

      return token;
    }

  });

};

/**
 * update a token
 *
 * @desc  update data of the token with the given
 *        id
 *
 * @param {Object} query  Query Object
 * @param {Object} updates  Update data
 */
exports.update = function update(query, updates) {
  debug(`updating token: ${query}`);

  let now = moment().toISOString();
  let opts = {
    'new': true,
    select: returnFields
  };

  updates = mongoUpdate(updates);

  return Token.findOneAndUpdate(query, updates, opts)
      .populate(population)
      .exec();
};

/**
 * get a token.
 *
 * @desc get a token with the given id from db
 *
 * @param {Object} query  Query object
 */
exports.get = function get(query) {
  debug(`getting token ${JSON.stringify(query)}`);

  return Token.findOne(query, returnFields)
      .populate(population)
      .exec();
};

/**
 * get a collection of tokens
 *
 * @desc get a collection of tokens from db
 *
 * @param {Object} query Query object
 */
exports.getCollection = function getCollection(query, qs) {
  debug(`fetching a collection of tokens ${query}`);

  return new Promise((resolve, reject) => {
    resolve(null,
       Token
       .find(query, returnFields)
       .populate(population)
       .stream());
  });

};

/**
 * get a collection of tokens using pagination
 *
 * @desc get a collection of tokens from db
 *
 * @param {Object} query Query Object
 */
exports.getCollectionByPagination = function getCollection(query, qs) {
  debug('fetching a collection of tokens');

  let opts = {
    tokens:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    qs.limit
  };


  return new Promise((resolve, reject) => {
    Token.paginate(query, opts, function (err, docs) {
      if(err) {
        return reject(err);
      }

      let data = {
        total_pages: docs.pages,
        total_docs_count: docs.total,
        current_page: docs.page,
        docs: docs.docs
      };

      resolve(data);

    });
  });

};
