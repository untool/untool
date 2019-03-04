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
  configureBuild(webpackConfig, loaderConfigs, target) {
    if (target === 'develop') {
      webpackConfig.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('LogPlugin', ({ endTime, startTime }) => {
            const duration = prettyMS(endTime - startTime);
            this.logger.info(`built successfully in ${duration}`);
          });
        },
      });
    }
  }
  configureServer(app) {
    const morgan = require('morgan');
    app.use(
      morgan('tiny', {
        stream: {
          write: (message) => this.logger.request(message.replace(/\s+$/, '')),
        },
      })
    );
  }
  inspectBuild(stats) {
    const report = stats.toString({
      chunks: false,
      colors: false,
      entrypoints: false,
      hash: false,
      modules: false,
      version: false,
    });
    this.logger.info(`built successfully\n\n${report}\n`);
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
