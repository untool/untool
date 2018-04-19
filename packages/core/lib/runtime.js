const define = require('mixinable');

exports.Mixin = class Mixin {
  constructor(config) {
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
    return (...callArgs) =>
      createMixinable(config, ...renderArgs).render(...callArgs);
  };
};
