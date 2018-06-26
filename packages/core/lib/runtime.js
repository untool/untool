const debug = require('debug')('untool:runtime');
const define = require('mixinable');

exports.Mixin = class Mixin {
  constructor(config) {
    this.config = config;
  }
};

exports.render = function render(...renderArgs) {
  return (config) => {
    const { mixins } = config;
    const strategies = mixins.reduce(
      (result, mixin) => Object.assign({}, result, mixin.strategies),
      {}
    );

    debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));

    const createMixinable = define(strategies)(...mixins);

    return function universalRenderMiddleware(...callArgs) {
      createMixinable(config, ...renderArgs).render(...callArgs);
    };
  };
};
