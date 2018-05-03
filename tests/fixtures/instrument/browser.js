/* eslint-env browser */
/* eslint-disable no-console */

const { Mixin } = require('@untool/core');

class InstrumentMixin extends Mixin {
  constructor(...args) {
    console.log('constructor', ...JSON.parse(JSON.stringify(args)));
    super(...args);
  }
  bootstrap(...args) {
    console.log('bootstrap', ...JSON.parse(JSON.stringify(args)));
    return args[0];
  }
  enhanceElement(...args) {
    console.log('enhanceElement', ...JSON.parse(JSON.stringify(args)));
    return args[0];
  }
  fetchData(...args) {
    console.log('fetchData', ...JSON.parse(JSON.stringify(args)));
    return args[0];
  }
  enhanceData(...args) {
    console.log('enhanceData', ...JSON.parse(JSON.stringify(args)));
    return args[0];
  }
}

module.exports = InstrumentMixin;
