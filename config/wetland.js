module.exports.wetland = {
  debug: false,
  mapping: {
    // Automatically convert camel-cased property names to underscored column-names.
    // defaultNamesToUnderscore: false,

    // Default values for mappings.
    // Useful to set auto-persist (defaults to empty array).
    defaults: {cascades: ['persist']}
  },
  stores: {
    // Use the key "defaultStore" to configure the, you got it, default store.
    // defaultStore: {
    //   client          : 'mysql',
    //   connection      : {
    //     user: 'root',
    //     database: 'tmp'
    //   }
    // }
  }
};
