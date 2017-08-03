# sails-hook-wetland

A sails hook that enables the use of [wetland ORM](https://wetland.spoonx.org/). It might be useful to take a look at the [quick start of wetland](https://wetland.spoonx.org/quick-start.html).

More documentation and examples will follow.

## Features

* All default sails blueprints.
* **NEW:** Custom count blueprint
* **NEW:** Blueprint options
* Nested populates.
* Migrations.
* Runs side-by-side with waterline.
* Unit of work (transactions).
* Dirty checking (optimized).
* Lower memory footprint.
* Performance.
* And the rest of the wetland features.

## Installation

1. `sails new myapplication`
2. `cd $_`
3. `npm i sails-hook-wetland --save`
4. Choose an adapter (list below) `npm i --save sqlite3`
5. `mkdir api/entity`

## Configuration

Out of the box, wetland works with sqlite3, so there's no need to configure anything.
You do however need to install sqlite3 if that's what you want to use, and create the `config/wetland.js` and `wetland.js` files.

Here are two code snippets that will do everything for you, assuming the `sqlite3` default as an adapter.
You can read how to configure other adapters further down the readme.

* `npm i sqlite3`
* `mkdir api/entity`
* `echo "module.exports.wetland = {};" > config/wetland.js`
* `echo "module.exports = require('./config/wetland').wetland;" > wetland.js`

An extensive list with config options and explanation can be found in [the wetland documentation](https://wetland.spoonx.org/configuration.html).

### Example config

The simplest configuration _(which will be what's used 9/10 times)_ is as follows:

**config/wetland.js**

```js
const path = require('path');

module.exports.wetland = {
  entityPath: path.resolve(process.cwd(), 'api', 'entity'),
  stores    : {
    defaultStore: {
      client    : 'mysql',
      connection: {
	    host    : '127.0.0.1',
	    user    : 'your_database_user',
	    password: 'your_database_password',
	    database: 'myapp_test'
      }
    }
  }
};
```

Wetland supports master/slave setups and pooling.
Documentation for these features will be added in the nearby future.

## Blueprints

This hook comes with all the default blueprints, and a count blueprint. It also adds some features for the current blueprints.

### New: Additional config options

Sails-hook-wetland offers additional options for blueprints.

```js
module.exports.blueprints = {

  // Enabling this options will include the total count for the current query in the results using the value as header key.
  // For instance, using 'X-Total-Count' as a value, will return the total count in the headers with every find request.
  countInResponse: false,

  // This option allows you to nest the response deeper.
  // So, you could use 'data' as a value here, and all responses will be wrapped.
  dataProperty: false
};
```

### Create and update

Code speaks. Take a look at this:

```js
const createAction = require('sails-hook-wetland/blueprints/create');
const updateAction = require('sails-hook-wetland/blueprints/update');
const My           = require('../Entity/My');

const MyController = {
  update (req, res) {
    return updateAction(req, res, MyController.getDetailed(req, actionUtil.requirePk(req), true), true);
  },

  create (req, res) {
    return createAction(req, res, true);
  },

  getDetailed(req, pk, update) {
    let options = {
      populate: [{'something': 's'}, 's.somethingElse', 's.anotherThing', 'whatever']
    };

    return req.getRepository(My).findOne((pk || actionUtil.requirePk(req)), options);
  },
};
```

This example shows how you can support nested creates, as well as nested updates based on your own provided base data.

The latter is useful when you want to apply nested updates. Wetland diffs and only pushes what is needed.
This gives you a chance to supply the base to use for the diff.

### Count

On top of the default blueprint, this hook also adds a `count` blueprint which, you guessed it, allows you to fetch a count.

All you need to do to add this is add a route:

```js
module.exports.routes = {
  'GET /my/count': {blueprint: 'count'}
};
```

And it's ready to be used:

```js
$ curl http://127.0.0.1:1337/my/count
{
  "count": 8
}
```

### Wetland CLI

To be able to use the [wetland CLI](https://github.com/SpoonX/wetland-cli), a `wetland.js` or `wetland.json` file must be present in the root directory of your project.
The wetland cli allows you to run & create migrations, manage your schema and work with snapshots.
It also helps you [generate entities](https://github.com/SpoonX/wetland-generator-entity).

The easiest way to do this is by creating a file called wetland.js in the root of your directory with the following contents:

```js
module.exports = require('./config/wetland').wetland;
```

#### Installing the CLI

In order to use the CLI, you'll have to install it first. You can do this by running `npm i -g wetland`.
You can verify installation worked by running `wetland --version`.

### Adapters

| Adapter | Command |
| ------------- | ------------- |
| mysql | `npm i mysql --save` |
| mysql2 | `npm i mysql2 --save` |
| pg | `npm i pg --save` |
| sqlite3 | `npm i sqlite3 --save` |
| mariasql | `npm i mariasql --save` |
| strong-oracle | `npm i strong-oracle --save` |
| oracle | `npm i oracle --save` |
| mssql | `npm i mssql --save` |

## Differences with waterline

The differences are minimal out of the box when working with blueprints.
Once you start writing custom code, the differences become more clear.

### No validation

Validation is a precious feature, that does not belong in an ORM.
Because wetland entities are simple classes, you can apply your own validation easily.

A good library for this is [joi](https://github.com/hapijs/joi), which is a joy to work with.

In the future there will be an opinionated validation plugin for wetland.
If there's enough demand, this will be bumped up on the priority list.

### Unit of work

To be able to guarantee data safety, wetland uses transactions for all queries. These queries are calculated once you _flush the changes_.

Flushing will trigger the unit of work to calculate changes you made (new, changed, removed and linked entities).

### No entity methods

Wetland doesn't have model methods. It separates logic and state using Entities and [Repositories](http://martinfowler.com/eaaCatalog/repository.html).

Instead, you'll be using repositories to fetch data from the database. Each entity can have its own repository, so it's possible to create your own repository and have it contain custom queries (using the query builder, or native).

### Migrations

Wetland supports migrations, including creating, running and auto-running (dev migrations) them.

[Read more here](https://wetland.spoonx.org/Tutorial/snapshots.html)

### IDs on entities

Out of the box, entities are exactly as you define them. No magical PK, no autoUpdatedAt or autoCreatedAt. All of these are up to you to implement. Because entities are just classes, you can create a base class and extend it.

### Entity definition

The way you specify the _mappings_ for your entities is different.

## Usage

In api, create a directory called `entity`. This is where wetland will look for your entities (comparable to models for waterline).

## Req methods

### req.getRepository([Entity])

Get the repository for provided Entity.
If none was supplied, the Entity for the current blueprint will be used instead.

**See also: [EntityRepository](https://wetland.spoonx.org/API/entity-repository.html).**

### req.getManager()

Use this method to get a new EntityManager scope.
This is used to call persist on, for instance. Check the wetland docs for more info.

### req.wetland

A convenience property pointing to the wetland instance.
