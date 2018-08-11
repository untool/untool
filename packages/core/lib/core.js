'use strict';

const debug = require('debug')('untool:core');
const define = require('mixinable');

const { getConfig } = require('./config');
const { environmentalize } = require('./env');

exports.Mixin = class Mixin {
  constructor(config) {
    this.config = config;
  }
};

exports.bootstrap = function bootstrap(overrides, ...args) {
  const config = environmentalize(getConfig(overrides));
  const mixins = config.mixins.core.map((mixin) => require(mixin));
  const strategies = {
    ...mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    ),
  };
  debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));

  return define(strategies)(...mixins)(config, ...args);
};
