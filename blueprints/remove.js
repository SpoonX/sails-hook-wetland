/**
 * Module dependencies
 */
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/remove');

const MetaData = require('wetland').MetaData;

module.exports = function removeFromCollection(req, res) {
  // Look up the model
  let Model = actionUtil.parseModel(req);

  if (!Model.mapping) {
    return fallback(req, res);
  }

  let mapping          = Model.mapping;
  let relationProperty = req.options.alias;
  let relation         = mapping.getRelation(relationProperty);

  if (!relation) {
    return res.serverError(new Error('Missing required route option, `relationProperty`.'));
  }

  let manager        = req.getManager();
  let ChildReference = manager.resolveEntityReference(relation.targetEntity);
  let parentPk       = req.param('parentid');
  let childPk        = actionUtil.parsePk(req);

  let repository = req.getRepository(Model.Entity);

  return repository.findOne(parentPk, {populate: relationProperty}).then(result => {
    if (!result) {
      return res.notFound();
    }

    let child = manager.getIdentityMap().fetch(ChildReference, childPk);

    if (!child) {
      return res.ok(result);
    }

    result[relationProperty].remove(child);

    return manager.flush().then(() => res.ok(result));
  }).catch(res.negotiate);
};
