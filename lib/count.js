/**
 * Module dependencies
 */

module.exports = function findRecords(repository, criteria, options) {
  let queryBuilder = repository.getQueryBuilder();

  if (criteria) {
    queryBuilder.where(criteria);
  }

  queryBuilder.select({count: '*'});

  repository.applyOptions(queryBuilder, options);

  return queryBuilder.getQuery().getSingleScalarResult();
};
