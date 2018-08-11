'use strict';

const {
  sync: { pipe, sequence, override },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class YargsMixin extends Mixin {
  handleError(error) {
    // eslint-disable-next-line no-console
    console.error(error.stack ? error.stack.toString() : error.toString());
    process.exit(1);
  }
}

YargsMixin.strategies = {
  registerCommands: pipe,
  configureCommand: pipe,
  handleArguments: sequence,
  handleError: override,
};

module.exports = YargsMixin;
