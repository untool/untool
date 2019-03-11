'use strict';

const detectDuplicates = require('duplitect');
const {
  async: { parallel },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const parallelWithFlatReturn = (...args) => {
  return parallel(...args).then((results) => [].concat(...results));
};

class DoctorMixin extends Mixin {
  bootstrap() {
    if (typeof this.getLogger === 'function') {
      const { config } = this;
      const logger = this.getLogger();
      return this.runChecks().then((warnings) =>
        [...config._warnings, ...warnings].forEach((warning) =>
          logger.warn(warning)
        )
      );
    }
  }
  runChecks() {
    const { _workspace } = this.config;
    return detectDuplicates(_workspace, '@untool/*').map(
      (duplicate) => `package '${duplicate}' should be installed just once`
    );
  }
}

DoctorMixin.strategies = {
  runChecks: validate(
    parallelWithFlatReturn,
    ({ length }) => {
      invariant(length === 0, 'runChecks(): Received unexpected argument(s)');
    },
    (result) => {
      invariant(Array.isArray(result), 'runChecks(): Did not return array');
    }
  ),
};

module.exports = DoctorMixin;
