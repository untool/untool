'use strict';

const { basename, dirname, join } = require('path');

const { load: loadEnv } = require('dotenv');
const { sync: findUp } = require('find-up');

const debug = require('debug')('untool:config');

const { loadConfig } = require('./loader');
const { resolveMixins } = require('./resolver');
const { environmentalize, placeholdify, merge } = require('./utils');

exports.getConfig = ({ untoolNamespace = 'untool', ...overrides } = {}) => {
  const pkgFile = findUp('package.json');
  const pkgData = require(pkgFile);
  const rootDir = dirname(pkgFile);

  loadEnv({ path: join(rootDir, '.env') });

  const defaults = {
    rootDir,
    name: pkgData.name || basename(rootDir),
    version: pkgData.version || '0.0.0',
    mixins: [],
    mixinTypes: {
      core: {
        mainFiles: ['mixin.core', 'mixin'],
        mainFields: ['mixin:core', 'mixin'],
      },
    },
  };
  const settings = loadConfig(untoolNamespace, pkgData, rootDir);

  const { mixins, mixinTypes, ...raw } = merge(defaults, settings, overrides);
  const config = {
    ...environmentalize(placeholdify(raw)),
    _mixins: resolveMixins(rootDir, mixinTypes, mixins),
  };
  debug(config);
  return config;
};

exports.getMixins = ({ _mixins: mixins }) => mixins.core.map(require);
