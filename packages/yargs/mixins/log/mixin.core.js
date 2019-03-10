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
  handleError(error) {
    this.logger.error(error);
  }
  configureBuild(webpackConfig) {
    const { LoggerPlugin } = require('../../lib/webpack');
    webpackConfig.plugins.push(new LoggerPlugin(this.logger));
  }
  configureServer(app, middlewares, mode) {
    if (mode !== 'static') {
      const { loggerMiddleware } = require('../../lib/request');
      app.use(loggerMiddleware(this.logger));
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
