/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/destroy');

module.exports = function destroyOneRecord(req, res) {
  // Look up the model
  let Model = actionUtil.parseModel(req);

  if (!Model.mapping) {
    return fallback(req, res);
  }

  let pk       = actionUtil.requirePk(req);
  let manager  = req.getManager();
  let populate = actionUtil.populateRequest(null, req);
  let options  = {};

  if (populate && populate.length && populate[0] !== undefined) {
    options.populate = populate;
  }

  return req.getRepository(Model.Entity)
    .findOne(pk, options)
    .then(record => {
      if (!record) {
        return res.notFound('No record found with the specified `id`.');
      }

      return manager.remove(record).flush()
        .then(() => res.ok(record));
    })
    .catch(res.negotiate);
};
