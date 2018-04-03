const define = require('mixinable');

const { bindAll } = require('./util');

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
    const strategies = mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    );
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
      core.render(...callArgs);
    };
  };
};
