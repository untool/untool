'use strict';

const isPlainObject = require('is-plain-object');
const define = require('mixinable');

const { getConfig, getMixins } = require('./lib/config');

exports.Mixin = class Mixin {
  constructor(config, ...args) {
    const options = args.slice(-1);
    this.config = config;
    this.options = isPlainObject(options) ? options : {};
  }
};

exports.initialize = function initialize(overrides = {}, ...args) {
  const config = getConfig(overrides);
  const mixins = getMixins(config);
  const strategies = mixins.reduce(
    (result, mixin) => ({
      ...result,
      ...Object.entries(mixin).reduce((strategies, [key, value]) => {
        if (typeof value === 'function') {
          strategies[key] = value;
        }
        return strategies;
      }, {}),
    }),
    {}
  );
  return define(strategies, mixins)(config, ...args);
};

exports.internal = { getConfig };
