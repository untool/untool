'use strict';

const { basename, dirname, join } = require('path');

const cosmiconfig = require('cosmiconfig');

const { load: loadEnv } = require('dotenv');
const { sync: findUp } = require('find-up');

const { merge } = require('./utils');
const { resolve, resolvePreset, isResolveError } = require('./resolver');

exports.createLoader = (namespace) => {
  const loadConfig = (stopDir, module) => {
    const { loadSync } = cosmiconfig(namespace, { stopDir });
    return loadSync(resolvePreset(stopDir, module));
  };
  const searchConfig = (stopDir) => {
    const { searchSync } = cosmiconfig(namespace, { stopDir });
    return searchSync(stopDir);
  };

  const loadPreset = (context, preset) => {
    try {
      return loadConfig(context, preset);
    } catch (error) {
      if (!isResolveError(error)) throw error;
      try {
        return searchConfig(
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
    const result = searchConfig(context);
    const settings = { ...(result && result.config) };
    if (!settings.presets) {
      settings.presets = [
        ...Object.keys(dependencies),
        ...(process.env.NODE_ENV !== 'production'
          ? Object.keys(devDependencies)
          : []),
      ].filter((key) => {
        try {
          return loadConfig(context, key);
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
