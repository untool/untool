const define = require('mixinable');

const config = require('./config');
const { bindAll } = require('./util');

exports.Mixin = class Mixin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
    this.mode = 'build';
    bindAll(this);
  }
};

exports.bootstrap = function bootstrap(...args) {
  const mixins = config.getMixins('core').map(mixin => require(mixin));
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
      get: () => mixinable[key].bind(mixinable),
    })
  );
  return core;
};
