import { readFileSync } from 'fs';
import { dirname, join } from 'path';

import { sync as findUp } from 'find-up';
import cosmiconfig from 'cosmiconfig';

import mergeWith from 'lodash.mergewith';
import isPlainObject from 'is-plain-object';
import flatten from 'flat';

import { preset as resolve } from './utils/resolve';

const pkgFile = findUp('package.json');
const pkgData = JSON.parse(readFileSync(pkgFile));

const rootDir = dirname(pkgFile);
const moduleDir = dirname(dirname(require.resolve('mixinable')));

const merge = (...args) =>
  mergeWith({}, ...args, (objValue, srcValue, key) => {
    if (Array.isArray(objValue)) {
      if ('plugins' === key) {
        return objValue.concat(srcValue);
      }
      return srcValue;
    }
  });

const loadConfig = (context, preset) => {
  try {
    const options = preset
      ? { configPath: resolve(context, preset), sync: true }
      : { rcExtensions: true, stopDir: context, sync: true };
    const explorer = cosmiconfig('untool', options);
    return explorer.load(context);
  } catch (_) {
    return null;
  }
};

const loadSettings = (...args) => {
  const result = loadConfig(...args);
  return result ? result.config : {};
};

const loadPresets = (parentContext, presets = []) =>
  presets.reduce((result, preset) => {
    const { config, filepath } =
      loadConfig(parentContext, preset) ||
      loadConfig(dirname(resolve(parentContext, join(preset, 'package.json'))));
    const context = dirname(filepath);
    if (config.plugins) {
      config.plugins = config.plugins.map(
        plugin => (plugin.startsWith('.') ? join(context, plugin) : plugin)
      );
    }
    return merge(result, loadPresets(context, config.presets), config);
  }, {});

const resolvePlaceholders = config => {
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
};

const defaults = {
  namespace: pkgData.name,
  version: pkgData.version,
  https: false,
  host: '0.0.0.0',
  port: 8080,
  locations: ['/'],
  basePath: '',
  assetPath: '<basePath>',
  browsers: '> 1%, last 2 versions, Firefox ESR',
  node: 'current',
  buildDir: '<rootDir>/dist',
  rootDir: rootDir,
  moduleDir: moduleDir,
  serverFile: 'server.js',
  assetFile: 'assets.json',
  assetTypes: ['js', 'css'],
  assetNames: ['<vendorName>', '<namespace>'],
  vendorName: 'vendor',
  cssModules: '[folder]-[name]-[local]-[hash:8]',
  plugins: [
    join(__dirname, 'plugins/', 'console-logger'),
    join(__dirname, 'plugins/', 'command-build'),
    join(__dirname, 'plugins/', 'command-develop'),
    join(__dirname, 'plugins/', 'command-serve'),
    join(__dirname, 'plugins/', 'command-start'),
    join(__dirname, 'plugins/', 'render-fallback'),
  ],
};

const settings = loadSettings(rootDir);

const presets = loadPresets(rootDir, settings.presets);

const config = (config =>
  config.env ? merge(config, config.env[process.env.NODE_ENV]) : config)(
  merge(defaults, presets, settings)
);

delete config.presets;
delete config.env;

export default resolvePlaceholders(config);
