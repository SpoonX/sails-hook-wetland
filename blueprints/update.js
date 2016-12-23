const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/update');
const util       = require('util');

module.exports = function updateOneRecord(req, res) {

  // Look up the model
  let Model = actionUtil.parseModel(req);

  if (!Model.mapping) {
    return fallback(req, res);
  }

  // Locate and validate the required `id` parameter.
  let pk = actionUtil.requirePk(req);

  // Default the value blacklist to just "id", so that models that have an
  // "id" field that is _not_ the primary key don't have the id field
  // updated mistakenly.  See https://github.com/balderdashy/sails/issues/3625
  req.options.values           = req.options.values || {};
  req.options.values.blacklist = req.options.values.blacklist || ['id'];

  // Create `values` object (monolithic combination of all parameters)
  // But omit the blacklisted params (like JSONP callback param, etc.)
  let values = actionUtil.parseValues(req);

  // No matter what, don't allow changing the PK via the update blueprint
  // (you should just drop and re-add the record if that's what you really want)
  if (typeof values[Model.primaryKey] !== 'undefined' && values[Model.primaryKey] != pk) {
    req._sails.log.warn('Cannot change primary key via update blueprint; ignoring value sent for `' + Model.primaryKey + '`');
  }

  // Make sure the primary key is unchanged
  values[Model.primaryKey] = pk;
  let manager              = req.getManager();
  let populator            = req.wetland.getPopulator(manager);

  populator.findDataForUpdate(pk, Model.Entity, values).then(base => {
    if (!base) {
      return res.notFound();
    }

    // Assign values to fetched base.
    populator.assign(Model.Entity, values, base);

    // Apply changes.
    return manager.flush().then(() => res.ok(base));
  }).catch(res.negotiate);
};
