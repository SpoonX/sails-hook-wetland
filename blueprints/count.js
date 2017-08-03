/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const count      = require('../lib/count');

module.exports = function findRecords(req, res) {
  let Model    = actionUtil.parseModel(req);
  let criteria = actionUtil.parseCriteria(req);

  if (!Model) {
    return res.badRequest('invalid_parameter');
  }

  let options = {
    limit  : actionUtil.parseLimit(req),
    offset : actionUtil.parseSkip(req),
    orderBy: actionUtil.parseSort(req)
  };

  count(req.getRepository(Model.Entity), criteria, options)
    .then(count => res.ok({count}))
    .catch(error => res.serverError('database_error', error));
};
