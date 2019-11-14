const { callable, override, parallel, pipe, compose } = require('mixinable');
const { Mixin } = require('../..');

class AMixin extends Mixin {
  callMe() {
    return this.operation();
  }

  overridden() {
    return 'from a-mixin';
  }

  parallel() {
    return 'from a-mixin';
  }

  pipe(input) {
    return `${input} Hello`.trim();
  }

  compose(input) {
    return { 'a-mixin': input };
  }
}

AMixin.strategies = {
  callMe: callable,
  overridden: override,
  parallel,
  pipe,
  compose,
};

module.exports = AMixin;
