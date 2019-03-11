'use strict';

const {
  sync: { override },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const Logger = require('../../lib/logger');

const { logLevels } = Logger;

class LogMixin extends Mixin {
  constructor(...args) {
    super(...args);
    const { name, _workspace } = this.config;
    this.logger = new Logger(name, _workspace);
  }
  getLogger() {
    return this.logger;
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
  }
  handleError(error) {
    this.getLogger().error(error);
  }
}

LogMixin.strategies = {
  getLogger: validate(override, ({ length }) => {
    invariant(length === 0, 'getLogger(): Received unexpected argument(s)');
  }),
};

module.exports = LogMixin;
