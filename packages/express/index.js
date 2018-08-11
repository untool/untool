'use strict';

exports.uri = require('./lib/uri');

const configure = (config = {}, options = {}) =>
  Object.assign(exports, {
    runServer(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.runServer(...args);
    },
    createServer(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.createServer(...args);
    },
    createRenderer(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.createRenderer(...args);
    },
    renderLocations(...args) {
      const core = require('@untool/core').bootstrap(config);
      core.handleArguments(options);
      return core.renderLocations(...args);
    },
    configure,
  });
configure();
