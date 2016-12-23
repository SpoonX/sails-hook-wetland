const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/create');

module.exports = function createRecord(req, res) {
  let Model = actionUtil.parseModel(req);

  if (!Model.mapping) {
    return fallback(req, res);
  }

  let data      = actionUtil.parseValues(req);
  let manager   = req.getManager();
  let newRecord = req.wetland.getPopulator(manager).assign(Model.Entity, data);

  manager.persist(newRecord).flush().then(() => {
    res.created(newRecord);
  }).catch(res.serverError);
};
