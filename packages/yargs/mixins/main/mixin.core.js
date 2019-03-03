'use strict';

const isPlainObject = require('is-plain-object');

const detectDuplicates = require('duplitect');
const {
  sync: { sequence, override },
  async: { parallel },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const sequenceWithReturn = (functions, arg, ...args) => {
  sequence(functions, arg, ...args);
  return arg;
};

const parallelWithFlatReturn = (...args) => {
  return parallel(...args).then((results) => [].concat(...results));
};

class YargsMixin extends Mixin {
  bootstrap() {
    const { config } = this;
    return this.runChecks().then((warnings) =>
      [...config._warnings, ...warnings].forEach((warning) =>
        this.handleWarning(warning)
      )
    );
  }
  runChecks() {
    const { _workspace } = this.config;
    return detectDuplicates(_workspace, '@untool/*').map(
      (duplicate) => `package '${duplicate}' should be installed just once`
    );
  }
  handleError(error) {
    // eslint-disable-next-line no-console
    console.error(error.stack ? error.stack.toString() : error.toString());
    process.exit(1);
  }
}

YargsMixin.strategies = {
  bootstrap: validate(parallel, ({ length }) => {
    invariant(length === 0, 'bootstrap(): Received unexpected argument(s)');
  }),
  runChecks: validate(
    parallelWithFlatReturn,
    ({ length }) => {
      invariant(length === 0, 'runChecks(): Received unexpected argument(s)');
    },
    (result) => {
      invariant(Array.isArray(result), 'runChecks(): Did not return array');
    }
  ),
  registerCommands: validate(sequence, ([yargs]) => {
    invariant(
      yargs && typeof yargs.command === 'function',
      'registerCommands(): Received invalid yargs instance'
    );
  }),
  configureCommand: validate(sequenceWithReturn, ([definition]) => {
    invariant(
      isPlainObject(definition) && definition.command && definition.builder,
      'configureCommand(): Received invalid command definition'
    );
  }),
  handleArguments: validate(sequence, ([args]) => {
    invariant(
      isPlainObject(args),
      'handleArguments(): Received invalid arguments object'
    );
  }),
  handleWarning: validate(override, ({ length }) => {
    invariant(length === 1, 'handleWarning(): Did not receive warning');
  }),
  handleError: validate(override, () => {}, () => process.exit(1)),
};

module.exports = YargsMixin;
