const { basename, dirname, join } = require('path');

const { sync: findUp } = require('find-up');
const cosmiconfig = require('cosmiconfig');
const mergeWith = require('lodash.mergewith');
const isPlainObject = require('is-plain-object');
const escapeRegExp = require('escape-string-regexp');
const flatten = require('flat');

const { create: { sync: createResolver } } = require('enhanced-resolve');

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

function loadPresets(context, presets = []) {
  return presets.reduce((result, preset) => {
    const { config, filepath } =
      loadConfig(context, preset) ||
      loadConfig(dirname(resolvePreset(context, join(preset, 'package.json'))));
    const newContext = dirname(filepath);
    if (config.mixins) {
      config.mixins = config.mixins.map(
        mixin => (mixin.startsWith('.') ? join(newContext, mixin) : mixin)
      );
    }
    return merge(result, loadPresets(newContext, config.presets), config);
  }, {});
}

function resolvePlaceholders(config) {
  const flatConfig = flatten(config);
  const keys = Object.keys(flatConfig);
  const regExp = new RegExp(`<(${keys.map(escapeRegExp).join('|')})>`, 'g');
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

exports.getConfig = () => {
  const pkgFile = findUp('package.json');
  const rootDir = dirname(pkgFile);

  const {
    name: namespace = basename(rootDir),
    version = '0.0.0',
  } = require(pkgFile);

  const defaults = { rootDir, namespace, version, mixins: [] };

  const settings = loadSettings(rootDir);

  const presets = loadPresets(rootDir, settings.presets);

  const rawConfig = (config =>
    config.env ? merge(config, config.env[process.env.NODE_ENV]) : config)(
    merge(defaults, presets, settings)
  );

  delete rawConfig.presets;
  delete rawConfig.env;

  const config = resolvePlaceholders(rawConfig);

  config.mixins = ['core', 'server', 'browser'].reduce(
    (result, key) => ({
      ...result,
      [key]: config.mixins
        .map(mixin => resolveMixin(key, config.rootDir, mixin))
        .filter((mixin, index, self) => mixin && self.indexOf(mixin) === index),
    }),
    {}
  );

  return config;
};
