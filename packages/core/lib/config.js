'use strict';

const { basename, dirname, join } = require('path');

const debug = require('debug')('untool:config');
const { sync: findUp } = require('find-up');
const { load: loadEnv } = require('dotenv');

const { createLoader } = require('./loader');
const { resolveMixins } = require('./resolve');
const { placeholdify, merge } = require('./utils');

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
}) => {
  const pkgFile = findUp('package.json');
  const pkgData = require(pkgFile);
  const rootDir = dirname(pkgFile);

  loadEnv({ path: join(rootDir, '.env') });

  const { loadSettings, loadPresets } = createLoader(namespace);
  const { name = basename(rootDir), version = '0.0.0' } = pkgData;

  const defaults = { rootDir, name, version, mixins: [] };
  const settings = loadSettings(rootDir, pkgData);
  const presets = loadPresets(rootDir, settings.presets);

  // eslint-disable-next-line no-unused-vars
  const { presets: _, ...raw } = merge(defaults, presets, settings, overrides);
  const config = {
    ...placeholdify(raw),
    mixins: resolveMixins(rootDir, raw.mixins, mixinTypes),
  };
  debug(config);
  return config;
};
