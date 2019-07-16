'use strict';

const { basename } = require('path');

const isPlainObject = require('is-plain-obj');

const debug = require('debug');
const debugConfig = (target, config) =>
  debug(`untool:webpack:config:${target}`)(config);

const {
  sync: { sequence, callable },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

class WebpackConfigMixin extends Mixin {
  getBuildConfig(target, watch = false) {
    const getBuildConfig = ['browser', 'node'].includes(target)
      ? require(`../../lib/configs/${target}`)
      : require(target);
    target = basename(target, '.js');
    const { loaderConfigs = {}, ...webpackConfig } = getBuildConfig(
      this.config,
      target,
      watch
    );
    this.configureBuild(webpackConfig, loaderConfigs, { target, watch });
    debugConfig(target, webpackConfig);
    return webpackConfig;
  }
  collectBuildConfigs(webpackConfigs) {
    webpackConfigs.push(this.getBuildConfig('browser'));
    if (!this.options.static) {
      webpackConfigs.push(this.getBuildConfig('node'));
    }
  }
  configureBuild(webpackConfig, loaderConfigs, { target }) {
    const { module } = webpackConfig;
    const configLoaderConfig = {
      test: require.resolve('@untool/core/lib/config'),
      loader: require.resolve('../../lib/utils/loader'),
      options: { type: target, config: this.config },
    };
    if (target === 'node') {
      configLoaderConfig.options.type = 'server';
    }
    module.rules.push(configLoaderConfig);
    if (typeof this.getLogger === 'function') {
      const { LoggerPlugin } = require('../../lib/plugins/log');
      webpackConfig.plugins.push(new LoggerPlugin(this.getLogger()));
    }
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

WebpackConfigMixin.strategies = {
  getBuildConfig: validate(callable, ([target, watch]) => {
    invariant(
      typeof target === 'string',
      'getBuildConfig(): Received invalid target string'
    );
    invariant(
      typeof watch === 'undefined' || typeof watch === 'boolean',
      'getBuildConfig(): Received invalid watch boolean'
    );
  }),
  collectBuildConfigs: validate(sequence, ([webpackConfigs]) => {
    invariant(
      Array.isArray(webpackConfigs),
      'collectBuildConfigs(): Received invalid webpackConfigs array'
    );
  }),
  configureBuild: validate(sequence, ([webpackConfig, loaderConfigs, env]) => {
    invariant(
      isPlainObject(webpackConfig),
      'configureBuild(): Received invalid webpackConfig object'
    );
    invariant(
      isPlainObject(loaderConfigs),
      'configureBuild(): Received invalid loaderConfigs object'
    );
    invariant(
      typeof env.target === 'string',
      'configureBuild(): Received invalid env.target string'
    );
    invariant(
      typeof env.watch === 'boolean',
      'configureBuild(): Received invalid env.watch boolean'
    );
  }),
};

module.exports = WebpackConfigMixin;
