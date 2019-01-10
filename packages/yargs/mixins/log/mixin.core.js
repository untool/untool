'use strict';
/* eslint-disable no-console */

const { format } = require('url');

const prettyMS = require('pretty-ms');

const { Mixin } = require('@untool/core');

module.exports = class CLIMixin extends Mixin {
  registerCommands(yargs) {
    yargs.option('quiet', {
      alias: 'q',
      description: 'Silence log output',
      type: 'boolean',
    });
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
    const { quiet } = this.options;
    if (!quiet) {
      const { name } = this.config;
      const mode = process.env.NODE_ENV || 'development';
      console.log(`[${name}] started in ${mode} mode`);
    }
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { quiet } = this.options;
    if (!quiet && target === 'develop') {
      const { name } = this.config;
      webpackConfig.plugins.push({
        apply(compiler) {
          compiler.hooks.done.tap('LogPlugin', ({ endTime, startTime }) => {
            const duration = prettyMS(endTime - startTime);
            console.log(`[${name}] built successfully in ${duration}`);
          });
        },
      });
    }
    return webpackConfig;
  }
  inspectBuild(stats) {
    const { quiet } = this.options;
    if (!quiet) {
      const { name } = this.config;
      const report = stats.toString({
        chunks: false,
        colors: false,
        entrypoints: false,
        hash: false,
        modules: false,
        version: false,
      });
      console.log(`[${name}] built successfully\n\n${report}\n`);
    }
  }
  inspectServer(server) {
    const { quiet } = this.options;
    if (!quiet) {
      const { name, https, basePath: pathname = '' } = this.config;
      const { port } = server.address();
      const hostname = 'localhost';
      const protocol = https ? 'https' : 'http';
      const parts = { protocol, hostname, port, pathname };
      console.log(`[${name}] listening at ${format(parts)}`);
      server.on('shutdown', () => {
        const { gracePeriod } = this.config;
        const timeout = prettyMS(gracePeriod);
        console.log(`[${name}] shutting down in ${timeout}`);
      });
    }
  }
};
