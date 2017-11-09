/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/find');
const findOne    = require('./findOne');
const count      = require('../lib/count');

module.exports = function findRecords(req, res) {

  // Look up the model
  let Model           = actionUtil.parseModel(req);
  let countInResponse = sails.config.blueprints.countInResponse;

  if (!Model.mapping) {
    return fallback(req, res);
  }

  if (actionUtil.parsePk(req)) {
    return findOne(req, res);
  }

  let populate   = actionUtil.populateRequest(null, req);
  let repository = req.getRepository(Model.Entity);
  let criteria   = actionUtil.parseCriteria(req);
  let options    = {
    limit  : actionUtil.parseLimit(req),
    offset : actionUtil.parseSkip(req),
    orderBy: actionUtil.parseSort(req),
  };

  if (populate && populate.length && populate[0] !== undefined) {
    options.populate = populate;
  }

  let promises = [repository.find(criteria, options)];

  if (countInResponse) {
    promises.push(count(repository, criteria, options));
  }

  Promise.all(promises)
    .then(results => {
      if (countInResponse) {
        res.set('Access-Control-Expose-Headers', countInResponse);
        res.set(countInResponse, results[1]);
      }

      let response = results[0] || [];

      if (sails.config.blueprints.dataProperty) {
        response = {[sails.config.blueprints.dataProperty]: response};
      }

      res.ok(response);
    })
    .catch(res.serverError);
};
