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

function resolveMixin(target, ...args) {
  try {
    const config = {
      extensions: ['.mjs', '.js'],
      mainFiles: [`mixin.${target}`, 'mixin'],
      mainFields: [
        `esnext:mixin:${target}`,
        `jsnext:mixin:${target}`,
        `mixin:${target}`,
        'esnext:mixin',
        'jsnext:mixin',
        'mixin',
      ],
    };
    if (target !== 'core') {
      config.mainFiles.splice(1, 0, 'mixin.runtime');
      config.mainFields.splice(
        3,
        0,
        'esnext:mixin:runtime',
        'jsnext:mixin:runtime',
        'mixin:runtime'
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
      if ('mixins' === key) {
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
    if (config.mixins) {
      config.mixins = config.mixins.map(
        mixin => (mixin.startsWith('.') ? join(context, mixin) : mixin)
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

const mixins = config.mixins || [];

delete config.mixins;

config.getMixins = target =>
  mixins
    .map(mixin => resolveMixin(target, config.rootDir, mixin))
    .filter((mixin, index, self) => mixin && self.indexOf(mixin) === index);
