/* eslint-env browser */
/* eslint-disable no-console */

class InstrumentMixin {
  constructor(...args) {
    console.log('constructor', ...JSON.parse(JSON.stringify(args)));
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
}

export default InstrumentMixin;
