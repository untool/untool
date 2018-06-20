const debug = require('debug')('untool:config');
const { basename, dirname, join } = require('path');

const {
  sync: resolve,
  create: { sync: createResolver },
} = require('enhanced-resolve');
const { sync: findUp } = require('find-up');
const cosmiconfig = require('cosmiconfig');
const mergeWith = require('lodash.mergewith');
const isPlainObject = require('is-plain-object');
const escapeRegExp = require('escape-string-regexp');
const flatten = require('flat');

const merge = (...args) =>
  mergeWith({}, ...args, (objValue, srcValue, key) => {
    if (Array.isArray(objValue)) {
      if ('mixins' === key) {
        return objValue.concat(srcValue);
      }
      return srcValue;
    }
  });

const resolvePreset = createResolver({
  mainFiles: ['preset'],
  mainFields: ['preset'],
});

const resolveCoreMixin = createResolver({
  mainFiles: ['mixin.core', 'mixin'],
  mainFields: ['mixin:core', 'mixin'],
});

const resolveServerMixin = createResolver({
  mainFiles: ['mixin.server', 'mixin.runtime', 'mixin'],
  mainFields: ['mixin:server', 'mixin:runtime', 'mixin'],
});

const resolveBrowserMixin = createResolver({
  mainFiles: ['mixin.browser', 'mixin.runtime', 'mixin'],
  mainFields: ['mixin:browser', 'mixin:runtime', 'mixin'],
});

const resolveMixin = (context, mixin, target) => {
  try {
    switch (target) {
      case 'core':
        return resolveCoreMixin(context, mixin);
      case 'server':
        return resolveServerMixin(context, mixin);
      case 'browser':
        return resolveBrowserMixin(context, mixin);
    }
  } catch (_) {
    return;
  }
};

const resolveMixins = (context, mixins) =>
  mixins.reduce(
    (result, mixin) => {
      let found = false;
      Object.keys(result).forEach((target) => {
        const targetMixin = resolveMixin(context, mixin, target);
        if (targetMixin) {
          if (!result[target].includes(targetMixin)) {
            result[target].push(targetMixin);
          }
          found = true;
        }
      });
      if (!found) {
        throw new Error(`Can't find mixin '${mixin}'`);
      }
      return result;
    },
    { core: [], server: [], browser: [] }
  );

const loadConfig = (context, config) => {
  const nsp = process.env.UNTOOL_NSP || 'untool';
  const env = process.env[nsp.toUpperCase() + '_ENV'] || process.env.NODE_ENV;
  const { loadSync, searchSync } = cosmiconfig(nsp, { stopDir: context });
  const configPath = config && resolvePreset(context, config);
  const result = configPath ? loadSync(configPath) : searchSync(context);
  return (
    result && {
      ...result,
      config:
        result && result.config && result.config.env
          ? merge(result.config, result.config.env[env])
          : result.config,
    }
  );
};

const loadSettings = (context) => {
  const result = loadConfig(context);
  return {
    presets: ['@untool/defaults'],
    ...(result ? result.config : {}),
  };
};

const loadPreset = (context, preset) => {
  const isResolveError = (error) =>
    error && error.message && error.message.startsWith("Can't resolve");
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

const loadPresets = (context, presets = []) =>
  presets.reduce((configs, preset) => {
    const { config, filepath } = loadPreset(context, preset);
    const presetContext = dirname(filepath);
    if (config.mixins) {
      config.mixins = config.mixins.map(
        (mixin) => (mixin.startsWith('.') ? join(presetContext, mixin) : mixin)
      );
    }
    return merge(configs, loadPresets(presetContext, config.presets), config);
  }, {});

const substitutePlaceholders = (config) => {
  const flatConfig = flatten(config);
  const keys = Object.keys(flatConfig);
  const regExp = new RegExp(`<(${keys.map(escapeRegExp).join('|')})>`, 'g');
  const substituteRecursive = (item) => {
    if (Array.isArray(item)) {
      return item.map(substituteRecursive);
    }
    if (isPlainObject(item)) {
      return Object.keys(item).reduce((result, key) => {
        result[key] = substituteRecursive(item[key]);
        return result;
      }, {});
    }
    if (typeof item === 'string') {
      return item.replace(regExp, (_, match) => {
        var result = flatConfig[match].toString();
        return regExp.test(result) ? substituteRecursive(result) : result;
      });
    }
    return item;
  };
  return substituteRecursive(config);
};

exports.getConfig = () => {
  const pkgFile = findUp('package.json');
  const rootDir = dirname(pkgFile);
  const { name = basename(rootDir), version = '0.0.0' } = require(pkgFile);

  const defaults = { rootDir, name, version, mixins: [] };
  const settings = loadSettings(rootDir);
  const presets = loadPresets(rootDir, settings.presets);
  const config = merge(defaults, presets, settings);

  delete config.presets;
  delete config.env;

  const result = {
    ...substitutePlaceholders(config),
    mixins: resolveMixins(rootDir, config.mixins),
  };

  debug(result);

  return result;
};
