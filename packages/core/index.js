'use strict';

const debug = require('debug')('untool:core');
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
  const strategies = {
    ...mixins.reduce(
      (result, mixin) => ({ ...result, ...mixin.strategies }),
      {}
    ),
  };
  debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));
  return define(strategies, mixins)(config, ...args);
};

exports.internal = { getConfig, ...require('./lib/utils') };
