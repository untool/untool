'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

const isPlainObject = require('is-plain-obj');

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
    this.statsPromise = new EnhancedPromise();
    this.handleArguments(this.options);
  }
  getBuildStats() {
    return Promise.resolve(this.statsPromise);
  }
  configureBuild(webpackConfig, loaderConfigs, { target }) {
    const { plugins } = webpackConfig;
    if (target === 'browser') {
      const { StatsPlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsPlugin(this.statsPromise, this.config));
    }
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'serve') {
      const { buildDir, statsFile } = this.config;
      const statsFilePath = join(buildDir, statsFile);
      this.statsPromise.resolve(
        exists(statsFilePath) ? require(statsFilePath) : {}
      );
    }
    const createStatsMiddleware = require('../../lib/middlewares/stats');
    middlewares.preroutes.push(createStatsMiddleware(this.statsPromise));
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

WebpackStatsMixin.strategies = {
  getBuildStats: validate(
    callable,
    ({ length }) => {
      invariant(
        length === 0,
        'getBuildStats(): Received unexpected argument(s)'
      );
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
