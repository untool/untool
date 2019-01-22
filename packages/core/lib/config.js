'use strict';
// This file is usually not being used at runtime, but only at buildtime.
// @untool/webpack is taking care of providing runtime configuration.

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

  const { name = basename(rootDir), version = '0.0.0' } = pkgData;

  const defaults = { rootDir, name, version, mixins: [] };
  const settings = loadConfig(untoolNamespace, pkgData, rootDir);

  const { mixins, ...raw } = merge(defaults, settings, overrides);
  const config = {
    ...environmentalize(placeholdify(raw)),
    _mixins: resolveMixins(rootDir, mixins),
  };
  debug(config);
  return config;
};

exports.getMixins = ({ _mixins: mixins }) => mixins.core.map(require);
