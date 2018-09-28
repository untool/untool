'use strict';

const { dirname, join } = require('path');

const cosmiconfig = require('cosmiconfig');

const { resolve, resolvePreset, isResolveError } = require('./resolve');
const { merge } = require('./utils');

exports.createLoader = (namespace) => {
  const loadConfig = (context, config) => {
    const { loadSync, searchSync } = cosmiconfig(namespace, {
      stopDir: context,
    });
    return config
      ? loadSync(resolvePreset(context, config))
      : searchSync(context);
  };
  const loadPreset = (context, preset) => {
    try {
      return loadConfig(context, preset);
    } catch (error) {
      if (!isResolveError(error)) throw error;
      try {
        return loadConfig(dirname(resolve(context, `${preset}/package.json`)));
      } catch (error) {
        if (!isResolveError(error)) throw error;
        throw new Error(`Can't find preset '${preset}' in '${context}'`);
      }
    }
  };
  return {
    loadSettings: function loadSettings(context, pkgData) {
      const { dependencies = {}, devDependencies = {} } = pkgData;
      const result = loadConfig(context);
      const settings = {
        ...(result ? result.config : {}),
      };
      if (!settings.presets) {
        settings.presets = Object.keys(dependencies)
          .concat(
            process.env.NODE_ENV !== 'production'
              ? Object.keys(devDependencies)
              : []
          )
          .filter((key) => {
            try {
              return loadConfig(context, key);
            } catch (error) {
              if (!isResolveError(error)) throw error;
              return null;
            }
          });
      }
      return settings;
    },
    loadPresets: function loadPresets(context, presets = []) {
      return presets.reduce((configs, preset) => {
        const { config, filepath } = loadPreset(context, preset);
        const newContext = dirname(filepath);
        if (config.mixins) {
          config.mixins = config.mixins.map(
            (mixin) => (mixin.startsWith('.') ? join(newContext, mixin) : mixin)
          );
        }
        return merge(configs, loadPresets(newContext, config.presets), config);
      }, {});
    },
  };
};
