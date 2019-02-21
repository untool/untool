'use strict';

const isPlainObject = require('is-plain-object');

const {
  sync: { sequence, override },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const sequenceWithReturn = (functions, definition, ...args) => {
  sequence(functions, definition, ...args);
  return definition;
};

class YargsMixin extends Mixin {
  handleError(error) {
    // eslint-disable-next-line no-console
    console.error(error.stack ? error.stack.toString() : error.toString());
    process.exit(1);
  }
}

YargsMixin.strategies = {
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
  handleError: validate(override, () => {}, () => process.exit(1)),
};

module.exports = YargsMixin;
