'use strict';
// This file is usually not being used at runtime, but only at buildtime.
// @untool/webpack is taking care of providing runtime configuration.

const debug = require('debug')('untool:config');

const { createLoader } = require('./loader');
const { createResolver } = require('./resolver');
const { placeholdify, environmentalize } = require('./utils');

const defaultNamespace = process.env.UNTOOL_NSP || 'untool';
const defaultMixinTypes = {
  core: ['core'],
  browser: ['browser', 'runtime'],
  server: ['server', 'runtime'],
};

exports.getConfig = ({
  untoolNamespace: namespace = defaultNamespace,
  untoolMixinTypes: mixinTypes = defaultMixinTypes,
  ...overrides
} = {}) => {
  const { loadConfig } = createLoader(namespace);
  const { resolveMixins } = createResolver(mixinTypes);
  // eslint-disable-next-line no-unused-vars
  const { presets: _, ...rawConfig } = loadConfig(overrides);
  const { rootDir, mixins } = rawConfig;
  const config = {
    ...placeholdify(rawConfig),
    mixins: resolveMixins(rootDir, mixins),
  };
  debug(config);
  return environmentalize(config);
};

exports.getMixins = (config) =>
  config.mixins.core.map((mixin) => require(mixin));
