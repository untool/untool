'use strict';

const debug = require('debug')('untool:core');
const define = require('mixinable');

const { getConfig, getMixins } = require('./lib/config');

exports.Mixin = class Mixin {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
  }
};

exports.bootstrap = function bootstrap(overrides = {}, ...args) {
  const config = getConfig(overrides);
  const mixins = getMixins(config);
  const strategies = {
    ...mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    ),
  };
  debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));
  return define(strategies, mixins)(config, ...args);
};

exports.internal = { getConfig };
