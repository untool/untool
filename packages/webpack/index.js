'use strict';

const { bootstrap } = require('@untool/core');

const configure = (config, options) => ({
  clean(...args) {
    return bootstrap(config, options).clean(...args);
  },
  build(...args) {
    return bootstrap(config, options).build(...args);
  },
  getWebpackBuildConfig(...args) {
    return bootstrap(config, options).getWebpackBuildConfig(...args);
  },
  getWebpackDevelopConfig(...args) {
    return bootstrap(config, options).getWebpackDevelopConfig(...args);
  },
  getWebpackNodeConfig(...args) {
    return bootstrap(config, options).getWebpackNodeConfig(...args);
  },
  configure,
});

module.exports = configure();
