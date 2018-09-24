'use strict';

const debug = require('debug')('untool:config');

const { basename, dirname, join } = require('path');

const mergeWith = require('lodash.mergewith');
const {
  sync: resolve,
  create: { sync: createResolver },
} = require('enhanced-resolve');
const { sync: findUp } = require('find-up');
const cosmiconfig = require('cosmiconfig');
const flatten = require('flat');
const escapeRegExp = require('escape-string-regexp');
const isPlainObject = require('is-plain-object');
const { load: loadEnv } = require('dotenv');

const defaultNamespace = process.env.UNTOOL_NSP || 'untool';

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

const isResolveError = (error) =>
  error && error.message && error.message.startsWith("Can't resolve");

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

const placeholdify = (config) => {
  const flatConfig = flatten(config);
  const flatKeys = Object.keys(flatConfig);
  const regExp = new RegExp(`<(${flatKeys.map(escapeRegExp).join('|')})>`, 'g');
  const replaceRecursive = (item) => {
    if (Array.isArray(item)) {
      return item.map(replaceRecursive);
    }
    if (isPlainObject(item)) {
      return Object.keys(item).reduce((result, key) => {
        result[key] = replaceRecursive(item[key]);
        return result;
      }, {});
    }
    if (regExp.test(item)) {
      return item.replace(regExp, (_, key) =>
        replaceRecursive(flatConfig[key] || '')
      );
    }
    return item;
  };
  return replaceRecursive(config);
};

exports.getConfig = ({ configNamespace = defaultNamespace, ...overrides }) => {
  const pkgFile = findUp('package.json');
  const pkgData = require(pkgFile);
  const rootDir = dirname(pkgFile);

  const { name = basename(rootDir), version = '0.0.0' } = pkgData;

  const mergeAndOverride = (...args) => {
    if (typeof overrides === 'function') {
      return overrides(merge(...args));
    } else {
      return merge(...args, overrides);
    }
  };

  const loadConfig = (context, config) => {
    const { loadSync, searchSync } = cosmiconfig(configNamespace, {
      stopDir: context,
    });
    return config
      ? loadSync(resolvePreset(context, config))
      : searchSync(context);
  };

  const loadSettings = (context, pkgData) => {
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

  const loadPresets = (context, presets = []) =>
    presets.reduce((configs, preset) => {
      const { config, filepath } = loadPreset(context, preset);
      const presetContext = dirname(filepath);
      if (config.mixins) {
        config.mixins = config.mixins.map(
          (mixin) =>
            mixin.startsWith('.') ? join(presetContext, mixin) : mixin
        );
      }
      return merge(configs, loadPresets(presetContext, config.presets), config);
    }, {});

  loadEnv({ path: join(rootDir, '.env') });

  const defaults = { rootDir, name, version, mixins: [] };
  const settings = loadSettings(rootDir, pkgData);
  const presets = loadPresets(rootDir, settings.presets);

  const rawConfig = mergeAndOverride(defaults, presets, settings);
  delete rawConfig.presets;

  const config = {
    ...placeholdify(rawConfig),
    mixins: resolveMixins(rootDir, rawConfig.mixins),
  };
  debug(config);
  return config;
};
