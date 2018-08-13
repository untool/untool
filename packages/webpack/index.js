'use strict';

const { bootstrap } = require('@untool/core');

const configure = (config, options) => ({
  clean(...args) {
    return bootstrap(config, options).clean(...args);
  },
  build(...args) {
    return bootstrap(config, options).build(...args);
  },
  getBuildConfig(...args) {
    return bootstrap(config, options).getBuildConfig(...args);
  },
  configure,
});

module.exports = configure();
