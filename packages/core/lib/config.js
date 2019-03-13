'use strict';

const { basename, dirname, join } = require('path');

const { config: loadEnv } = require('dotenv');
const { sync: findUp } = require('find-up');
const Ajv = require('ajv');

const debug = require('debug')('untool:config');

const { loadConfig } = require('./loader');
const { resolveMixins } = require('./resolver');
const { environmentalize, placeholdify, merge } = require('./utils');

const validate = (config, properties) => {
  const ajv = new Ajv({ allErrors: true });
  if (ajv.validate({ properties }, config)) {
    return [];
  } else {
    return ajv.errors.map(
      ({ dataPath, message }) => `config${dataPath} ${message}`
    );
  }
};

exports.getConfig = ({ untoolNamespace = 'untool', ...overrides } = {}) => {
  const pkgFile = findUp('package.json');
  const pkgData = require(pkgFile);
  const rootDir = dirname(pkgFile);
  const lockFile = findUp('yarn.lock', { cwd: rootDir });

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
    configSchema: {
      rootDir: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      version: { type: 'string', minLength: 1 },
    },
  };
  const settings = loadConfig(untoolNamespace, pkgData, rootDir);

  const raw = merge(defaults, settings, overrides);
  const { mixins, mixinTypes, configSchema, ...clean } = raw;
  const processed = environmentalize(placeholdify(clean));

  const config = {
    ...processed,
    _mixins: resolveMixins(rootDir, mixinTypes, mixins),
    _warnings: validate(processed, configSchema),
    _workspace: lockFile ? dirname(lockFile) : rootDir,
  };
  debug(config);
  return config;
};

exports.getMixins = ({ _mixins: mixins }) => mixins.core.map(require);
