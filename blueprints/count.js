/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = function findRecords(req, res) {
  let Model    = actionUtil.parseModel(req);
  let criteria = actionUtil.parseCriteria(req);

  if (!Model) {
    return res.badRequest('invalid_parameter');
  }

  let repository   = req.getRepository(Model.Entity);
  let queryBuilder = repository.getQueryBuilder();
  let options      = {
    limit  : actionUtil.parseLimit(req),
    offset : actionUtil.parseSkip(req),
    orderBy: actionUtil.parseSort(req)
  };

  if (criteria) {
    queryBuilder.where(criteria);
  }

  if (criteria) {
    queryBuilder.where(criteria);
  }

  queryBuilder.select({count: '*'});

  repository.applyOptions(queryBuilder, options);

  queryBuilder.getQuery().getSingleScalarResult()
    .then(count => res.ok({count}))
    .catch(error => res.serverError('database_error', error));
};
