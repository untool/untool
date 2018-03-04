import { dirname, join } from 'path';

import { sync as findUp } from 'find-up';
import cosmiconfig from 'cosmiconfig';

import mergeWith from 'lodash.mergewith';
import isPlainObject from 'is-plain-object';
import flatten from 'flat';

import enhancedResolve from 'enhanced-resolve';

const { create: { sync: createResolver } } = enhancedResolve;

function resolvePreset(...args) {
  try {
    return createResolver({
      extensions: ['.mjs', '.js'],
      mainFiles: ['preset'],
      mainFields: ['esnext:preset', 'jsnext:preset', 'preset'],
    })(...args);
  } catch (_) {
    throw new Error(`preset not found ${args[1]}`);
  }
}

function resolvePlugin(target, ...args) {
  try {
    const config = {
      extensions: ['.mjs', '.js'],
      mainFiles: [`plugin.${target}`, 'plugin'],
      mainFields: [
        `esnext:plugin:${target}`,
        `jsnext:plugin:${target}`,
        `plugin:${target}`,
        'esnext:plugin',
        'jsnext:plugin',
        'plugin',
      ],
    };
    if (target !== 'core') {
      config.mainFiles.splice(1, 0, 'plugin.runtime');
      config.mainFields.splice(
        3,
        0,
        'esnext:plugin:runtime',
        'jsnext:plugin:runtime',
        'plugin:runtime'
      );
    }
    return createResolver(config)(...args);
  } catch (_) {
    return null;
  }
}

const rootDir = dirname(findUp('package.json'));

function merge(...args) {
  return mergeWith({}, ...args, (objValue, srcValue, key) => {
    if (Array.isArray(objValue)) {
      if ('plugins' === key) {
        return objValue.concat(srcValue);
      }
      return srcValue;
    }
  });
}

function loadConfig(context, preset) {
  try {
    const options = preset
      ? { configPath: resolvePreset(context, preset), sync: true }
      : { rcExtensions: true, stopDir: context, sync: true };
    const explorer = cosmiconfig('untool', options);
    return explorer.load(context);
  } catch (_) {
    return null;
  }
}

function loadSettings(...args) {
  const result = loadConfig(...args);
  return result ? result.config : {};
}

function loadPresets(parentContext, presets = []) {
  return presets.reduce((result, preset) => {
    let { config, filepath } =
      loadConfig(parentContext, preset) ||
      loadConfig(
        dirname(resolvePreset(parentContext, join(preset, 'package.json')))
      );
    const context = dirname(filepath);
    if (config.__esModule) {
      config = config.default;
    }
    if (config.plugins) {
      config.plugins = config.plugins.map(
        plugin => (plugin.startsWith('.') ? join(context, plugin) : plugin)
      );
    }
    return merge(result, loadPresets(context, config.presets), config);
  }, {});
}

function resolvePlaceholders(config) {
  const flatConfig = flatten(config);
  const keys = Object.keys(flatConfig);
  const regExp = new RegExp('<(' + keys.join('|') + ')>', 'g');
  const replaceRecursive = item => {
    if (isPlainObject(item)) {
      return Object.keys(item).reduce((result, key) => {
        result[key] = replaceRecursive(item[key]);
        return result;
      }, {});
    }
    if (Array.isArray(item)) {
      return item.map(replaceRecursive);
    }
    if (typeof item === 'string') {
      return item.replace(regExp, function(_, match) {
        var result = flatConfig[match].toString();
        return regExp.test(result) ? replaceRecursive(result) : result;
      });
    }
    return item;
  };
  return replaceRecursive(config);
}

const settings = loadSettings(rootDir);

const presets = loadPresets(rootDir, settings.presets);

const rawConfig = (config =>
  config.env ? merge(config, config.env[process.env.NODE_ENV]) : config)(
  merge(presets, settings)
);

delete rawConfig.presets;
delete rawConfig.env;

export const config = resolvePlaceholders(rawConfig);

const plugins = config.plugins || [];
delete config.plugins;

config.getPlugins = target =>
  plugins
    .map(plugin => resolvePlugin(target, config.rootDir, plugin))
    .filter(plugin => !!plugin);
