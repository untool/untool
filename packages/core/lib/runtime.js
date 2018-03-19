const define = require('mixinable');

const { bindAll } = require('./util');

const { override } = define;

exports.Mixin = class Mixin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
    bindAll(this);
  }
};

exports.render = function render(...renderArgs) {
  return config => {
    const { mixins } = config;
    const strategies = {
      ...mixins.reduce(
        (result, mixin) => ({ ...result, ...mixin.strategies }),
        {}
      ),
      render: override,
    };
    const createMixinable = define(strategies)(...mixins);
    return (...callArgs) => {
      const core = {};
      const mixinable = createMixinable(core, config, ...renderArgs);
      Object.keys(strategies).forEach(key =>
        Object.defineProperty(core, key, {
          enumerable: true,
          configurable: true,
          get: () => mixinable[key].bind(mixinable),
        })
      );
      return core.render(...callArgs);
    };
  };
};
