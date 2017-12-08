const Homefront = require('homefront').Homefront;

/**
 * Module dependencies
 */
module.exports = function findRecords(repository, criteria, options) {
  let queryBuilder = repository.getQueryBuilder();
  let countOptions = new Homefront();

  if (criteria) {
    queryBuilder.where(criteria);
  }

  queryBuilder.select({count: '*'});

  countOptions.merge(options);

  countOptions
    .remove('limit')
    .remove('offset');

  repository.applyOptions(queryBuilder, countOptions);

  return queryBuilder.getQuery().getSingleScalarResult();
};
