'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

const {
  async: { callable },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const { Resolvable } = require('../../utils/resolvable');

class WebpackStatsMixin extends Mixin {
  constructor(...args) {
    super(...args);
    this.stats = new Resolvable();
  }
  getBuildStats() {
    return Promise.resolve(this.stats);
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { plugins } = webpackConfig;
    if (target === 'node') {
      const { StatsFilePlugin } = require('../../plugins/stats');
      plugins.unshift(new StatsFilePlugin(this.stats, this.config));
    }
    if (target === 'develop' || target === 'build') {
      const { StatsPlugin } = require('../../plugins/stats');
      plugins.unshift(new StatsPlugin(this.stats));
    }
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'serve') {
      const { serverDir, statsFile } = this.config;
      const statsFilePath = join(serverDir, statsFile);
      this.stats.resolve(exists(statsFilePath) ? require(statsFilePath) : {});
    }
    const createStatsMiddleware = require('../../middleware/stats');
    middlewares.preroutes.push(createStatsMiddleware(this.stats));
  }
}

WebpackStatsMixin.strategies = {
  getBuildStats: callable,
};

module.exports = WebpackStatsMixin;
