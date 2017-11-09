/**
 * Module dependencies
 */
const Mapping    = require('wetland').Mapping;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const fallback   = require('sails/lib/hooks/blueprints/actions/add');

module.exports = function addToCollection(req, res) {
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
  let childMapping   = Mapping.forEntity(ChildReference);

  if (!childMapping) {
    return res.serverError(new Error(`Mapping for '${relation.targetEntity}' not found.`));
  }

  let parentPk        = req.param('parentid');
  let supposedChildPk = actionUtil.parsePk(req);
  let child;

  if (supposedChildPk) {
    child = manager.getRepository(ChildReference).findOne(supposedChildPk);
  } else {
    req.options.values           = req.options.values || {};
    req.options.values.blacklist = req.options.values.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];
    child                        = new ChildReference();

    Object.assign(child, actionUtil.parseValues(req));

    manager.persist(child);

    child = Promise.resolve(child);
  }

  child.then(resolvedChild => {
    if (!resolvedChild) {
      return res.notFound();
    }

    return req.getRepository(Model.Entity)
      .findOne(parentPk, {populate: relationProperty})
      .then(result => {
        if (!result) {
          return res.notFound();
        }

        result[relationProperty].add(resolvedChild);

        return manager.flush().then(() => res.ok(result));
      });
  }).catch(res.negotiate);
};
