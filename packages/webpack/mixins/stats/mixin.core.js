'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

const {
  async: { callable },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const { Resolvable } = require('../../lib/utils/resolvable');

class WebpackStatsMixin extends Mixin {
  constructor(...args) {
    super(...args);
    this.resolvable = new Resolvable();
  }
  getBuildStats() {
    return Promise.resolve(this.resolvable);
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { plugins } = webpackConfig;
    if (target === 'develop' || target === 'build') {
      const { StatsPlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsPlugin(this.resolvable));
    }
    if (target === 'node') {
      const { StatsFilePlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsFilePlugin(this.resolvable, this.config));
    }
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'serve') {
      const { serverDir, statsFile } = this.config;
      const statsFilePath = join(serverDir, statsFile);
      this.resolvable.resolve(
        exists(statsFilePath) ? require(statsFilePath) : {}
      );
    }
    const createStatsMiddleware = require('../../lib/middlewares/stats');
    middlewares.preroutes.push(createStatsMiddleware(this.resolvable));
  }
}

WebpackStatsMixin.strategies = {
  getBuildStats: callable,
};

module.exports = WebpackStatsMixin;
