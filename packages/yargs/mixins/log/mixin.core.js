'use strict';

const prettyMS = require('pretty-ms');

const { Mixin } = require('@untool/core');

const Logger = require('../../lib/logger');

const { logLevels } = Logger;

module.exports = class CLIMixin extends Mixin {
  constructor(...args) {
    super(...args);
    const { name, _workspace } = this.config;
    this.logger = new Logger(name, _workspace);
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
    this.logger.setLogLevel(logLevels.info + verbose - quiet);
    this.logger.info(
      `started in ${process.env.NODE_ENV || 'development'} mode`
    );
  }
  handleError(error, recoverable) {
    this.logger.error(error);
    if (!recoverable) process.exit(1);
  }
  configureBuild(webpackConfig) {
    const { LoggerPlugin } = require('../../lib/webpack');
    webpackConfig.plugins.push(new LoggerPlugin(this.logger));
  }
  configureServer(app, middlewares, mode) {
    if (mode !== 'static') {
      const morgan = require('morgan');
      const split = require('split');
      app.use(
        morgan('tiny', {
          stream: split().on('data', (line) => this.logger.request(line)),
        })
      );
    }
  }
  inspectServer(server) {
    server.on('startup', (address) => {
      const { basePath = '' } = this.config;
      this.logger.info(`listening at ${address}/${basePath}`);
    });
    server.on('shutdown', () => {
      const { gracePeriod } = this.config;
      const timeout = prettyMS(gracePeriod);
      this.logger.warn(`shutting down in ${timeout}`);
    });
  }
  inspectWarnings(warnings) {
    warnings.forEach((warning) => this.logger.warn(warning));
  }
};
