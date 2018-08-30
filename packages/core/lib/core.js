'use strict';

const debug = require('debug')('untool:core');
const isPlainObject = require('is-plain-object');
const define = require('mixinable');

const { getConfig } = require('./config');

const environmentalize = (_config) => {
  const _env = {};
  const { env } = process;
  const regExp = /\[(\w+?)\]/g;
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
        replaceRecursive((_env[key] = env[key] || ''))
      );
    }
    return item;
  };
  return Object.assign(replaceRecursive(_config), { _config, _env });
};

exports.Mixin = class Mixin {
  constructor(config, options) {
    this.config = config;
    this.options = options;
  }
};

exports.bootstrap = function bootstrap(configOverrides = {}, options = {}) {
  const config = environmentalize(getConfig(configOverrides));
  const mixins = config.mixins.core.map((mixin) => require(mixin));
  const strategies = {
    ...mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    ),
  };
  debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));

  return define(strategies, mixins)(config, options);
};
