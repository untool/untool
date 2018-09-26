'use strict';
/* global config, getMixins, mainMethod */

const debug = require('debug')('untool:runtime');
const define = require('mixinable');

const { override } = define;

exports.Mixin = class Mixin {
  constructor(config) {
    this.config = config;
  }
};

exports.bootstrap = function bootstrap(...args) {
  const mixins = getMixins();
  const strategies = mixins.reduce(
    (result, mixin) => Object.assign({}, result, mixin.strategies),
    { [mainMethod]: override }
  );
  debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));

  return define(strategies, mixins)(config, ...args);
};

exports[mainMethod] = function(...bootstrapArgs) {
  return function universal(...callArgs) {
    exports.bootstrap(...bootstrapArgs)[mainMethod](...callArgs);
  };
};

exports.internal = {
  getConfig() {
    return config;
  },
};
