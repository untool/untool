const { callable, override, parallel, pipe, compose } = require('mixinable');
const { Mixin } = require('../..');

class AnotherMixin extends Mixin {
  operation() {
    return 'execute operation';
  }

  overridden() {
    return 'from another-mixin';
  }

  parallel() {
    return 'from another-mixin';
  }

  pipe(input) {
    return `${input} World`.trim();
  }

  compose(input) {
    return { 'another-mixin': input };
  }
}

AnotherMixin.strategies = {
  operation: callable,
  overridden: override,
  parallel,
  pipe,
  compose,
};

module.exports = AnotherMixin;
