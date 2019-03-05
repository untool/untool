'use strict';

const { format } = require('url');

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
    const { quiet, verbose } = (this.options = { ...this.options, ...argv });
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
    const morgan = require('morgan');
    if (mode !== 'static') {
      app.use(
        morgan('tiny', {
          stream: {
            write: (message) =>
              this.logger.request(message.replace(/\s+$/, '')),
          },
        })
      );
    }
  }
  inspectServer(server) {
    const { https, basePath: pathname = '' } = this.config;
    const { port } = server.address();
    const hostname = 'localhost';
    const protocol = https ? 'https' : 'http';
    const parts = { protocol, hostname, port, pathname };
    this.logger.info(`listening at ${format(parts)}`);
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
