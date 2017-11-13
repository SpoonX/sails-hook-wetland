const Wetland    = require('wetland').Wetland;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const Model      = require('./Model');
const path       = require('path');
/* eslint-disable global-require */
const blueprints = {
  find    : require('./blueprints/find'),
  create  : require('./blueprints/create'),
  findone : require('./blueprints/findOne'),
  update  : require('./blueprints/update'),
  destroy : require('./blueprints/destroy'),
  populate: require('./blueprints/populate'),
  add     : require('./blueprints/add'),
  remove  : require('./blueprints/remove'),
  count   : require('./blueprints/count'),
};
/* eslint-enable global-require */

actionUtil.populateQuery = (query, associations, sails) => {
  let defaultLimit = (sails && sails.config.blueprints.defaultLimit) || 30;
  let populates    = associations.map(association => {
    if (query) {
      query.populate(association.alias, {
        limit: association.limit || defaultLimit,
      });
    }

    return association.alias;
  });

  if (query) {
    return query;
  }

  return populates;
};

module.exports = sails => {
  let hook = {
    defaults: () => {
      return {
        wetland: {
          entityPath: path.resolve(process.cwd(), 'api', 'entity'),
        },
      };
    },

    configure: () => {
      sails.config.globals.wetland = sails.config.globals.wetland || false;
    },

    registerEntity: (name, Entity) => {
      this.wetland.registerEntity(Entity);

      hook.registerModel(name, {entity: Entity, mapping: this.wetland.getEntityManager().getMapping(Entity)});
    },

    registerModel: (name, Entity) => {
      let model = new Model(name, Entity);

      sails.models[model.identity] = model;
    },

    registerActions: () => {
      for (modelIdentity in sails.models) {
        if (sails.models.hasOwnProperty(modelIdentity)) {
          for (blueprintName in blueprints) {
            if (blueprints.hasOwnProperty(blueprintName)) {
              sails.registerAction(blueprints[blueprintName], modelIdentity + '/' + blueprintName, true);
            }
          }
        }
      }
    },

    initialize: callback => {
      sails.on('hook:orm:loaded', () => {
        this.wetland = new Wetland(sails.config.wetland);

        // Make model stubs
        let entities = this.wetland.getEntityManager().getEntities();

        Object.getOwnPropertyNames(entities).forEach(name => hook.registerModel(name, entities[name]));

        if (parseFloat(sails.version) >= 1) { // Test if it's sails V1
          this.registerActions();
        } else {
          // Override default blueprints
          Object.getOwnPropertyNames(blueprints).forEach(function (action) {
            sails.hooks.blueprints.middleware[action] = blueprints[action];
          });
        }

        sails.wetland = this.wetland;

        if (sails.config.models.migrate) {
          if (sails.config.models.migrate === 'safe') {
            return callback();
          }

          if (sails.config.environment !== 'development') {
            sails.log.warn(`Refusing to run dev migrations because environment '${sails.config.environment}' isn't development.`);

            return callback();
          }

          if (sails.config.models.migrate !== 'alter') {
            sails.log.warn('Not running dev migrations. The only support method is "alter".');

            return callback();
          }

          sails.log.verbose('Starting dev migrations...');

          this.wetland.getMigrator().devMigrations()
            .then(() => {
              sails.log.verbose('Running dev migrations happened successfully.');

              callback();
            })
            .catch(error => {
              sails.log.error('Running dev migrations failed.');

              callback(error);
            });
        } else {
          return callback();
        }
      });
    },

    routes: {
      before: {
        '*': (req, res, next) => {
          if (!res.created) {
            res.created = created.bind({req, res});
          }

          let manager;
          let getManager = () => {
            if (!manager) {
              manager = this.wetland.getManager();
            }

            return manager;
          };

          // Convenience functions on req to work with database.
          req.getManager = getManager;

          req.getRepository = (Entity) => {
            if (!Entity) {
              Entity = actionUtil.parseModel(req).Entity;
            }

            return getManager().getRepository(Entity);
          };

          // Make wetland accessible
          req.wetland = this.wetland;

          // You may now proceed, peasant.
          return next();
        },
      },
    },
  };

  return hook;
};
