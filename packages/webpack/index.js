'use strict';

const configure = (config = {}, options = {}) =>
  Object.assign(exports, {
    clean(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.clean(...args);
    },
    build(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.build(...args);
    },
    getBuildConfig(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.getBuildConfig(...args);
    },
    configure,
  });
configure();
