/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/find');

module.exports = function findRecords(req, res) {

  // Look up the model
  let Model = actionUtil.parseModel(req);

  if (!Model.mapping) {
    return fallback(req, res);
  }

  if (actionUtil.parsePk(req)) {
    return require('./findOne')(req, res);
  }

  let populate   = actionUtil.populateRequest(null, req);
  let repository = req.getRepository(Model.Entity);
  let options    = {
    limit  : actionUtil.parseLimit(req),
    offset : actionUtil.parseSkip(req),
    orderBy: actionUtil.parseSort(req)
  };

  if (populate && populate.length && populate[0] !== undefined) {
    options.populate = populate;
  }

  repository.find(actionUtil.parseCriteria(req), options)
    .then(matchingRecords => res.ok(matchingRecords))
    .catch(res.serverError);
};
