const Mapping = require('wetland').Mapping;

module.exports = class Model {
  constructor(name, entity) {
    let mapping   = entity.mapping;
    let relations = mapping.getRelations();

    this.Entity       = entity.entity;
    this.mapping      = mapping;
    this.associations = [];
    this.primaryKey   = mapping.getPrimaryKey();
    this.identity     = name.toLowerCase();

    if (!relations) {
      return;
    }

    Object.getOwnPropertyNames(relations).forEach(property => {
      let relation = relations[property];
      let model    = {};
      let type     = relation.type === Mapping.RELATION_MANY_TO_MANY || relation.type === Mapping.RELATION_ONE_TO_MANY
        ? 'collection'
        : 'model';

      model.alias = property;
      model.type  = type;
      model[type] = relation.targetEntity.toLowerCase();

      if (relation.inversedBy) {
        model.via = relation.inversedBy;
      } else if (relation.mappedBy) {
        model.via = relation.mappedBy;
      }

      this.associations.push(model);
    });
  }
};
