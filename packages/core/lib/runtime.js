const define = require('mixinable');

exports.Mixin = class Mixin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
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
          get: () => mixinable[key],
        })
      );
      core.render(...callArgs);
    };
  };
};
