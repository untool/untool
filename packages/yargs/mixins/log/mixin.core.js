'use strict';

const {
  sync: { override },
  async: { parallel },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const Doctor = require('../../lib/doctor');
const Logger = require('../../lib/logger');

const { logLevels } = Logger;

const parallelWithFlatReturn = (...args) => {
  return parallel(...args).then((results) => [].concat(...results));
};

class LogMixin extends Mixin {
  constructor(...args) {
    super(...args);
    const { name, _workspace } = this.config;
    this.logger = new Logger(name, _workspace);
  }
  getLogger() {
    return this.logger;
  }
  diagnose(doctor) {
    doctor.validateConfig();
    doctor.detectDuplicatePackages('@untool/*');
  }
  bootstrap() {
    this.doctor = new Doctor(this.config, this.getLogger());
    return this.diagnose(this.doctor);
  }
  registerCommands(yargs) {
    yargs
      .option('quiet', {
        alias: 'q',
        description: 'Decrease log output',
        count: true,
      })
      .option('verbose', {
        alias: 'v',
        description: 'Increase log output',
        count: true,
      });
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
    const { quiet, verbose } = this.options;
    const logger = this.getLogger();
    logger.setLogLevel(logLevels.info + verbose - quiet);
    logger.info(`started in ${process.env.NODE_ENV || 'development'} mode`);
    this.doctor.logResults();
  }
  handleError(error) {
    this.getLogger().error(error);
  }
}

LogMixin.strategies = {
  getLogger: validate(override, ({ length }) => {
    invariant(length === 0, 'getLogger(): Received unexpected argument(s)');
  }),
  diagnose: validate(parallelWithFlatReturn, ([doctor]) => {
    invariant(
      doctor instanceof Doctor,
      'diagnose(): Received invalid doctor instance'
    );
  }),
};

module.exports = LogMixin;
