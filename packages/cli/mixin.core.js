'use strict';

const { format } = require('url');

const prettyMS = require('pretty-ms');

module.exports = class CLIMixin {
  constructor(config) {
    this.config = config;
  }
  registerCommands(yargs) {
    return yargs.option('quiet', {
      alias: 'q',
      description: 'Silence log output',
      type: 'boolean',
    });
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
    const { quiet } = this.options;
    const { name } = this.config;
    if (!quiet) {
      process.stdout.write(
        `[${name}] started in ${process.env.NODE_ENV || 'development'} mode\n`
      );
    }
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    if (target === 'develop') {
      const { quiet } = this.options;
      const { name } = this.config;
      if (!quiet) {
        webpackConfig.plugins.push({
          apply(compiler) {
            compiler.hooks.done.tap('untool-log-plugin', (stats) => {
              process.stdout.write(
                `[${name}] built successfully in ${prettyMS(
                  stats.endTime - stats.startTime
                )}\n`
              );
            });
          },
        });
      }
    }
    return webpackConfig;
  }
  inspectBuild(stats) {
    const { quiet } = this.options;
    const { name } = this.config;
    if (!quiet) {
      process.stdout.write(
        `[${name}] built successfully\n\n${stats.toString({
          colors: false,
          version: false,
          hash: false,
          modules: false,
          entrypoints: false,
          chunks: false,
        })}\n\n`
      );
    }
  }
  inspectServer(server) {
    const { quiet } = this.options;
    const { name, https, basePath: pathname } = this.config;
    if (!quiet) {
      const { address, port } = server.address();
      const hostname = ['::', '::1', '0.0.0.0', '127.0.0.1'].includes(address)
        ? 'localhost'
        : address;
      const protocol = https ? 'https' : 'http';
      const parts = { protocol, hostname, port, pathname };
      process.stdout.write(`[${name}] listening at ${format(parts)}\n`);
    }
  }
};
