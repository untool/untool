'use strict';

const { bootstrap } = require('@untool/core');

const createWebpackMiddleware = require('./lib/middleware/render');
const createStatsMiddleware = require('./lib/middleware/stats');

const { RenderPlugin } = require('./lib/plugins/render');
const { StatsPlugin, StatsFilePlugin } = require('./lib/plugins/stats');

const runtimeLoader = require('./lib/utils/loader');
const { isESNext, isExternal } = require('./lib/utils/helpers');
const { Resolvable } = require('./lib/utils/resolvable');

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
  internal: {
    createWebpackMiddleware,
    createStatsMiddleware,
    RenderPlugin,
    StatsPlugin,
    StatsFilePlugin,
    runtimeLoader,
    isESNext,
    isExternal,
    Resolvable,
  },
  configure,
});

module.exports = configure();
