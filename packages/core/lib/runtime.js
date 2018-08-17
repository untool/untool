'use strict';

const debug = require('debug')('untool:runtime');
const define = require('mixinable');

const { environmentalize } = require('./env');

exports.Mixin = class Mixin {
  constructor(config) {
    this.config = config;
  }
};

exports.render = function render(...renderArgs) {
  return (baseConfig, mixins) => {
    const config = environmentalize(baseConfig);
    const strategies = mixins.reduce(
      (result, mixin) => Object.assign({}, result, mixin.strategies),
      {}
    );
    const createMixinable = define(strategies, mixins);

    debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));

    return function universalRender(...callArgs) {
      createMixinable(config, ...renderArgs).render(...callArgs);
    };
  };
};
