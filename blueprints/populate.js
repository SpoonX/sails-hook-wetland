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

  let childPk           = actionUtil.parsePk(req);
  let alias             = Model.identity;
  let repository        = req.getRepository(Model.Entity);
  let queryBuilder      = repository.getQueryBuilder(Model.identity);
  let childQueryBuilder = queryBuilder.where({[alias]: req.param('parentid')}).populate(req.options.alias);
  let childAlias        = childQueryBuilder.getAlias();

  repository.applyOptions(childQueryBuilder, {
    limit  : actionUtil.parseLimit(req),
    offset : actionUtil.parseSkip(req),
    orderBy: actionUtil.parseSort(req)
  });

  req.options.criteria           = req.options.criteria || {};
  req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];

  childQueryBuilder.select(childAlias).where(childPk ? {[childAlias]: childPk} : actionUtil.parseCriteria(req));

  // Return the property on the first result.
  queryBuilder.getQuery().getResult().then(result => res.ok(Array.isArray(result) ? result[0][req.options.alias] : [])).catch(res.serverError);
};
