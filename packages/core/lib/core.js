'use strict';

const debug = require('debug')('untool:core');
const define = require('mixinable');

const { getConfig } = require('./config');
const { environmentalize } = require('./env');

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
