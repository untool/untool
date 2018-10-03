'use strict';

const { basename, dirname, join } = require('path');

const cosmiconfig = require('cosmiconfig');

const { load: loadEnv } = require('dotenv');
const { sync: findUp } = require('find-up');

const { merge } = require('./utils');
const { createResolver } = require('./resolver');

exports.createLoader = (namespace) => {
  const { resolve, resolvePreset, isResolveError } = createResolver();

  const loadOrSearchConfig = (stopDir, module) => {
    const { loadSync, searchSync } = cosmiconfig(namespace, { stopDir });
    return module
      ? loadSync(resolvePreset(stopDir, module))
      : searchSync(stopDir);
  };

  const loadPreset = (context, preset) => {
    try {
      return loadOrSearchConfig(context, preset);
    } catch (error) {
      if (!isResolveError(error)) throw error;
      try {
        return loadOrSearchConfig(
          dirname(resolve(context, `${preset}/package.json`))
        );
      } catch (error) {
        if (!isResolveError(error)) throw error;
        throw new Error(`Can't find preset '${preset}' in '${context}'`);
      }
    }
  };

  const loadPresets = (context, presets = []) =>
    presets.reduce((configs, preset) => {
      const { config, filepath } = loadPreset(context, preset);
      const newContext = dirname(filepath);
      if (config.mixins) {
        config.mixins = config.mixins.map(
          (mixin) => (mixin.startsWith('.') ? join(newContext, mixin) : mixin)
        );
      }
      return merge(configs, loadPresets(newContext, config.presets), config);
    }, {});

  const loadSettings = (context, pkgData) => {
    const { dependencies = {}, devDependencies = {} } = pkgData;
    const result = loadOrSearchConfig(context);
    const settings = { ...(result && result.config) };
    if (!settings.presets) {
      settings.presets = [
        ...Object.keys(dependencies),
        ...(process.env.NODE_ENV !== 'production'
          ? Object.keys(devDependencies)
          : []),
      ].filter((key) => {
        try {
          return loadOrSearchConfig(context, key);
        } catch (error) {
          if (!isResolveError(error)) throw error;
          return null;
        }
      });
    }
    return settings;
  };

  return {
    loadConfig: function loadConfig(overrides) {
      const pkgFile = findUp('package.json');
      const pkgData = require(pkgFile);
      const rootDir = dirname(pkgFile);

      const { name = basename(rootDir), version = '0.0.0' } = pkgData;

      loadEnv({ path: join(rootDir, '.env') });

      const defaults = { rootDir, name, version, mixins: [] };
      const settings = loadSettings(rootDir, pkgData);
      const presets = loadPresets(rootDir, settings.presets);

      return merge(defaults, presets, settings, overrides);
    },
  };
};
