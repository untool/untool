'use strict';

const { intialize } = require('@untool/core');

const uri = require('./lib/uri');

const configure = (config, options) => ({
  runServer(...args) {
    return intialize(config, options).runServer(...args);
  },
  createServer(...args) {
    return intialize(config, options).createServer(...args);
  },
  createRenderer(...args) {
    return intialize(config, options).createRenderer(...args);
  },
  configure,
  internal: { uri },
});

module.exports = configure();
