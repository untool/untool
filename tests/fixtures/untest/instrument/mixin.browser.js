/* eslint-env browser */
/* eslint-disable no-console */

const { decycle } = require('cycle');

const { Mixin } = require('@untool/core');

class InstrumentMixin extends Mixin {
  constructor(...args) {
    console.log('constructor', ...JSON.parse(JSON.stringify(decycle(args))));
    super(...args);
  }
  bootstrap(...args) {
    console.log('bootstrap', ...JSON.parse(JSON.stringify(decycle(args))));
    return args[0];
  }
  enhanceElement(...args) {
    console.log('enhanceElement', ...JSON.parse(JSON.stringify(decycle(args))));
    return args[0];
  }
  fetchData(...args) {
    console.log('fetchData', ...JSON.parse(JSON.stringify(decycle(args))));
    return args[0];
  }
}

module.exports = InstrumentMixin;
