'use strict';

const { existsSync: exists, readFileSync } = require('fs');
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
  configureBuild(webpackConfig, loaderConfigs, target) {
    console.log(
      new Date(),
      'WebpackStatsMixin: configureBuild hook called for target: %s',
      target
    );
    const { plugins } = webpackConfig;
    if (target === 'develop' || target === 'build') {
      const { StatsPlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsPlugin(this.statsPromise));
    }
    if (target === 'node' && this.writeStats) {
      const { StatsFilePlugin } = require('../../lib/plugins/stats');
      plugins.unshift(new StatsFilePlugin(this.statsPromise, this.config));
    }
  }
  configureServer(app, middlewares, mode) {
    console.log(
      new Date(),
      'WebpackStatsMixin: configureServer hook called in mode: %s',
      mode
    );
    if (mode === 'serve') {
      const { serverDir, statsFile } = this.config;
      const statsFilePath = join(serverDir, statsFile);
      const statsContent = exists(statsFilePath)
        ? readFileSync(statsFilePath, 'utf-8')
        : '{}';
      console.log('statsFilePath: %s', statsFilePath);
      console.log('statsFile length: %s', statsContent.length);
      console.log('statsFile first characters: %s', statsContent.substr(0, 5));
      console.log('statsFile last characters: %s', statsContent.substr(-5));
      try {
        this.statsPromise.resolve(JSON.parse(statsContent));
      } catch (error) {
        console.log('could not parse stats file', error);
        throw error;
      }
    }
    const createStatsMiddleware = require('../../lib/middlewares/stats');
    middlewares.preroutes.push(createStatsMiddleware(this.statsPromise));
  }
  handleArguments(argv) {
    console.log(new Date(), 'handleArguments hook called with argv: %o', argv);
    this.options = { ...this.options, ...argv };
    const { _: commands = [] } = this.options;
    const isProduction = process.env.NODE_ENV === 'production';
    this.writeStats =
      commands.includes('build') ||
      (commands.includes('start') && isProduction);
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
