/* eslint-env browser */
/* eslint-disable no-console */

const { decycle } = require('cycle');

const { Mixin } = require('@untool/core');

const sanitize = (args) => JSON.parse(JSON.stringify(decycle(args)));

class InstrumentMixin extends Mixin {
  constructor(...args) {
    super(...args);
    console.log('constructor', ...sanitize(args));
  }
  bootstrap(...args) {
    console.log('bootstrap', ...sanitize(args));
    return args[0];
  }
  enhanceElement(...args) {
    console.log('enhanceElement', ...sanitize(args));
    return args[0];
  }
  fetchData(...args) {
    console.log('fetchData', ...sanitize(args));
    return args[0];
  }
}

module.exports = InstrumentMixin;
