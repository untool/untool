'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

const isPlainObject = require('is-plain-object');

const EnhancedPromise = require('eprom');
const {
  async: { callable },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

class WebpackStatsMixin extends Mixin {
  constructor(...args) {
    super(...args);
    this.enhancedPromise = new EnhancedPromise();
  }
  getBuildStats() {
    return Promise.resolve(this.enhancedPromise);
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { plugins } = webpackConfig;
    if (target === 'develop' || target === 'build') {
      const { StatsPlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsPlugin(this.enhancedPromise));
    }
    if (target === 'node') {
      const { StatsFilePlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsFilePlugin(this.enhancedPromise, this.config));
    }
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'serve') {
      const { serverDir, statsFile } = this.config;
      const statsFilePath = join(serverDir, statsFile);
      this.enhancedPromise.resolve(
        exists(statsFilePath) ? require(statsFilePath) : {}
      );
    }
    const createStatsMiddleware = require('../../lib/middlewares/stats');
    middlewares.preroutes.push(createStatsMiddleware(this.enhancedPromise));
  }
}

WebpackStatsMixin.strategies = {
  getBuildStats: validate(
    callable,
    ({ length }) => {
      invariant(length === 0, 'getBuildStats(): Received obsolete argument(s)');
    },
    (result) => {
      invariant(
        isPlainObject(result),
        'getBuildStats(): Returned invalid stats data'
      );
    }
  ),
};

module.exports = WebpackStatsMixin;
