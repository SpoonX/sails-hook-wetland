const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/findOne');

module.exports = function findOneRecord(req, res) {

  let Model = actionUtil.parseModel(req);

  if (!Model.mapping) {
    return fallback(req, res);
  }

  let pk        = actionUtil.requirePk(req);
  let options   = {};
  let populates = actionUtil.populateRequest(null, req);

  if (populates.length) {
    options.populate = populates;
  }

  req.getRepository(Model.Entity).findOne(pk, options).then(matchingRecord => {
    if (!matchingRecord) {
      return res.notFound('No record found with the specified `id`.');
    }

    res.ok(matchingRecord);
  }).catch(res.serverError);
};
