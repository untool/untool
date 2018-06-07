const define = require('mixinable');

const { getConfig } = require('./config');

exports.Mixin = class Mixin {
  constructor(config) {
    this.config = config;
  }
};

exports.bootstrap = function bootstrap(...args) {
  const config = getConfig();
  const mixins = config.mixins.core.map((mixin) => require(mixin));
  const strategies = {
    ...mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    ),
  };
  return define(strategies)(...mixins)(config, ...args);
};
