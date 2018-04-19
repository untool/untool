const define = require('mixinable');

const { getConfig } = require('./config');

exports.Mixin = class Mixin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
  }
};

exports.bootstrap = function bootstrap(...args) {
  const config = getConfig();
  const mixins = config.mixins.core.map(mixin => require(mixin));
  const strategies = {
    ...mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    ),
  };
  const createMixinable = define(strategies)(...mixins);
  const core = {};
  const mixinable = createMixinable(core, config, ...args);
  Object.keys(strategies).forEach(key =>
    Object.defineProperty(core, key, {
      enumerable: true,
      configurable: true,
      get: () => mixinable[key],
    })
  );
  return core;
};
