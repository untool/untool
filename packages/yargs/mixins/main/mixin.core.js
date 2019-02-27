'use strict';

const isPlainObject = require('is-plain-object');

const {
  sync: { sequence, override },
  async: { parallel },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const {
  validateInstallation,
  validateConfig,
  validateEnv,
} = require('../../lib/utils');

const sequenceWithReturn = (functions, definition, ...args) => {
  sequence(functions, definition, ...args);
  return definition;
};

class YargsMixin extends Mixin {
  bootstrap() {
    return this.runChecks(
      validateConfig(this.config),
      validateEnv({ ...process.env })
    )
      .then((results) => {
        const warnings = [].concat(...results);
        if (warnings.length) {
          this.handleWarning(...warnings);
        }
      })
      .catch(this.handleError);
  }
  runChecks(validateConfig) {
    return validateInstallation(this.config).then((results) => {
      return [
        ...results,
        ...validateConfig({
          type: 'object',
          properties: {
            rootDir: { type: 'string', minLength: 1 },
            name: { type: 'string', minLength: 1 },
            version: { type: 'string', minLength: 1 },
          },
          required: ['rootDir', 'name', 'version'],
        }),
      ];
    });
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
    parallel,
    ([validateConfig, validateEnv]) => {
      invariant(
        typeof validateConfig === 'function',
        'runChecks(): Received invalid validateConfig helper'
      );
      invariant(
        typeof validateEnv === 'function',
        'runChecks(): Received invalid validateEnv helper'
      );
    },
    (result) => {
      invariant(
        Array.isArray(result),
        'runChecks(): Returned non-array result'
      );
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
    invariant(length > 0, 'handleWarning(): Received no warnings');
  }),
  handleError: validate(override, () => {}, () => process.exit(1)),
};

module.exports = YargsMixin;
