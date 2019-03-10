/* eslint-env browser */
/* eslint-disable no-console */

const { decycle } = require('cycle');

const { Mixin } = require('untool');

const sanitize = (args) => JSON.parse(JSON.stringify(decycle(args)));

const data = (window.__untest = {});

class InstrumentMixin extends Mixin {
  constructor(...args) {
    super(...args);
    data._constructor = sanitize(args);
  }
  bootstrap(...args) {
    data._bootstrap = sanitize(args);
    return args[0];
  }
  enhanceElement(...args) {
    data._enhanceElement = sanitize(args);
    return args[0];
  }
  fetchData(...args) {
    data._fetchData = sanitize(args);
    return args[0];
  }
}

module.exports = InstrumentMixin;
