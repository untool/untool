const { basename, dirname, join } = require('path');

const { create: { sync: createResolver } } = require('enhanced-resolve');
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

const resolvePreset = (context, preset) => {
  return createResolver({
    mainFiles: ['preset'],
    mainFields: ['preset'],
  })(context, preset);
};

const resolveMixin = (target, context, mixin) => {
  try {
    const config = {
      mainFiles: [`mixin.${target}`, 'mixin'],
      mainFields: [`mixin:${target}`, 'mixin'],
    };
    if (target !== 'core') {
      config.mainFiles.splice(1, 0, 'mixin.runtime');
      config.mainFields.splice(1, 0, 'mixin:runtime');
    }
    return createResolver(config)(context, mixin);
  } catch (_) {
    return null;
  }
};

const applyEnv = result => {
  const env = process.env.UNTOOL_ENV || process.env.NODE_ENV;
  const config = result && result.config;
  return result
    ? {
        ...result,
        config: config && config.env ? merge(config, config.env[env]) : config,
      }
    : result;
};

const loadConfig = (context, preset) => {
  const nsp = process.env.UNTOOL_NSP || 'untool';
  const explorer = cosmiconfig(nsp, { cache: false, stopDir: context });
  const presetPath = preset && resolvePreset(context, preset);
  return applyEnv(
    presetPath ? explorer.loadSync(presetPath) : explorer.searchSync(context)
  );
};

const loadSettings = context => {
  const result = loadConfig(context);
  return result ? result.config : {};
};

const loadPreset = (context, preset) => {
  try {
    return loadConfig(context, preset);
  } catch (_) {
    return loadConfig(
      dirname(resolvePreset(context, `${preset}/package.json`))
    );
  }
};

const loadPresets = (context, presets = []) =>
  presets.reduce((configs, preset) => {
    const { config, filepath } = loadPreset(context, preset);
    const newContext = dirname(filepath);
    if (config.mixins) {
      config.mixins = config.mixins.map(
        mixin => (mixin.startsWith('.') ? join(newContext, mixin) : mixin)
      );
    }
    return merge(configs, loadPresets(newContext, config.presets), config);
  }, {});

const substitutePlaceholders = config => {
  const flatConfig = flatten(config);
  const keys = Object.keys(flatConfig);
  const regExp = new RegExp(`<(${keys.map(escapeRegExp).join('|')})>`, 'g');
  const substituteRecursive = item => {
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
      return item.replace(regExp, function(_, match) {
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
  const {
    name: namespace = basename(rootDir),
    version = '0.0.0',
  } = require(pkgFile);

  const defaults = { rootDir, namespace, version, mixins: [] };
  const settings = loadSettings(rootDir);
  const presets = loadPresets(rootDir, settings.presets);
  const rawConfig = merge(defaults, presets, settings);

  delete rawConfig.presets;
  delete rawConfig.env;

  const config = substitutePlaceholders(rawConfig);

  config.mixins = ['core', 'server', 'browser'].reduce(
    (result, target) => ({
      ...result,
      [target]: config.mixins
        .map(mixin => resolveMixin(target, config.rootDir, mixin))
        .filter((mixin, index, self) => mixin && self.indexOf(mixin) === index),
    }),
    {}
  );

  return config;
};
