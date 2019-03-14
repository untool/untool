'use strict';

const {
  sync: { override },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const { createLogger, logLevels } = require('../../lib/logger');

class LogMixin extends Mixin {
  constructor(...args) {
    super(...args);
    const { name, _workspace } = this.config;
    this.logger = createLogger(name, _workspace);
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
    const { quiet, verbose, _: commands } = this.options;
    const [command] = commands;
    const logger = this.getLogger();
    logger.setLogLevel(logLevels.info + verbose - quiet);
    logger.info(
      `running '${command}' in '${process.env.NODE_ENV || 'development'}' mode`
    );
  }
  handleError(error) {
    this.getLogger().error(error);
  }
  inspectWarnings(warnings) {
    warnings.forEach((warning) => this.getLogger().warn(warning));
  }
}

LogMixin.strategies = {
  getLogger: validate(override, ({ length }) => {
    invariant(length === 0, 'getLogger(): Received unexpected argument(s)');
  }),
};

module.exports = LogMixin;
