'use strict';

const { initialize } = require('@untool/core');

const createWebpackMiddleware = require('./lib/middleware/render');
const createStatsMiddleware = require('./lib/middleware/stats');

const { RenderPlugin } = require('./lib/plugins/render');
const { StatsPlugin, StatsFilePlugin } = require('./lib/plugins/stats');

const configLoader = require('./lib/utils/loader');
const { isESNext, isExternal } = require('./lib/utils/helpers');
const { Resolvable } = require('./lib/utils/resolvable');

const configure = (config, options) => ({
  clean(...args) {
    return initialize(config, options).clean(...args);
  },
  build(...args) {
    return initialize(config, options).build(...args);
  },
  getBuildConfig(...args) {
    return initialize(config, options).getBuildConfig(...args);
  },
  internal: {
    createWebpackMiddleware,
    createStatsMiddleware,
    RenderPlugin,
    StatsPlugin,
    StatsFilePlugin,
    configLoader,
    isESNext,
    isExternal,
    Resolvable,
  },
  configure,
});

module.exports = configure();
