'use strict';
/* global getConfig, getMixins */
/* this will be replaced by our webpack loader */

const debug = require('debug')('untool:runtime');
const define = require('mixinable');

exports.Mixin = class Mixin {
  constructor(config) {
    this.config = config;
  }
};

exports.bootstrap = function bootstrap(...args) {
  const mixins = getMixins();
  const strategies = mixins.reduce(
    (result, mixin) => ({ ...result, ...mixin.strategies }),
    {}
  );
  debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));
  return define(strategies, mixins)(getConfig(), ...args);
};

exports.internal = { getConfig };
