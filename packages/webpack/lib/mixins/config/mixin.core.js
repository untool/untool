'use strict';

const { existsSync: exists } = require('fs');

const debug = require('debug');
const debugConfig = (target, config) =>
  debug(`untool:webpack:config:${target}`)(config);

const {
  sync: { sequence, callable },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class WebpackConfigMixin extends Mixin {
  getBuildConfig(target, baseConfig) {
    const { loaderConfigs = {}, ...webpackConfig } = (() => {
      switch (baseConfig || target) {
        case 'build':
          return require('../../configs/build')(this.config);
        case 'develop':
          return require('../../configs/develop')(this.config);
        case 'node':
          return require('../../configs/node')(this.config);
        default:
          if (baseConfig && exists(baseConfig)) {
            return require(baseConfig)(this.config);
          }
          throw new Error(`Can't get build config ${baseConfig || target}`);
      }
    })();
    this.configureBuild(webpackConfig, loaderConfigs, target);
    debugConfig(target, webpackConfig);
    return webpackConfig;
  }
  collectBuildConfigs(webpackConfigs) {
    webpackConfigs.push(this.getBuildConfig('build'));
    if (!this.options.static) {
      webpackConfigs.push(this.getBuildConfig('node'));
    }
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { module } = webpackConfig;
    const configLoaderConfig = {
      test: require.resolve('@untool/core/lib/config'),
      loader: require.resolve('../../utils/loader'),
      options: { type: target, config: this.config },
    };
    if (target === 'node') {
      configLoaderConfig.options.type = 'server';
    }
    if (target === 'develop' || target === 'build') {
      configLoaderConfig.options.type = 'browser';
    }
    module.rules.push(configLoaderConfig);
  }
  configureServer(app, middlewares, mode) {
    if (mode !== 'static') {
      const { browsers } = this.config;
      const createAgentMiddleware = require('../../middleware/agent');
      middlewares.initial.push(createAgentMiddleware(browsers));
    }
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

WebpackConfigMixin.strategies = {
  getBuildConfig: callable,
  collectBuildConfigs: sequence,
  configureBuild: sequence,
};

module.exports = WebpackConfigMixin;
