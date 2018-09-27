'use strict';

const { bootstrap } = require('@untool/core');

const uri = require('./lib/uri');

const configure = (config, options) => ({
  runServer(...args) {
    return bootstrap(config, options).runServer(...args);
  },
  createServer(...args) {
    return bootstrap(config, options).createServer(...args);
  },
  createRenderer(...args) {
    return bootstrap(config, options).createRenderer(...args);
  },
  renderLocations(...args) {
    return bootstrap(config, options).renderLocations(...args);
  },
  configure,
  internal: { uri },
});

module.exports = configure();
