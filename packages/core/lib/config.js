'use strict';
// This file is usually not being used at runtime, but only at buildtime.
// @untool/webpack is taking care of providing runtime configuration.

const debug = require('debug')('untool:config');

const { createConfigLoader } = require('./loader');
const { createMixinResolver } = require('./resolver');
const { placeholdify, environmentalize } = require('./utils');

const defaultNamespace = 'untool';
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
  const { loadConfig } = createConfigLoader(namespace);
  const { resolveMixins } = createMixinResolver(mixinTypes);
  const { presets, mixins, ...rawConfig } = loadConfig(overrides);
  const config = {
    ...environmentalize(placeholdify(rawConfig)),
    _mixins: resolveMixins(rawConfig.rootDir, mixins),
    _presets: presets,
  };
  debug(config);
  return config;
};

exports.getMixins = ({ _mixins: mixins }) =>
  Array.from(mixins.core || []).map(require);
