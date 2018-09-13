'use strict';
/* eslint-disable no-console */

const { format } = require('url');
const { basename } = require('path');

const prettyMS = require('pretty-ms');

const { Mixin } = require('@untool/core');

module.exports = class CLIMixin extends Mixin {
  constructor(...args) {
    super(...args);
    const { name, rootDir } = this.config;
    this.isFixture = basename(rootDir) !== 'untest';
    if (!this.isFixture) {
      console.log(
        `[${name}] started in ${process.env.NODE_ENV || 'development'} mode`
      );
    }
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    if (target === 'develop') {
      const { name } = this.config;
      if (!this.isFixture) {
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
    const { name } = this.config;
    if (!this.isFixture) {
      console.log(
        `[${name}] built successfully\n\n${stats.toString({
          colors: false,
          version: false,
          hash: false,
          modules: false,
          entrypoints: false,
          chunks: false,
        })}\n`
      );
    }
  }
  inspectServer(server) {
    const { name, https, basePath: pathname } = this.config;
    if (!this.isFixture) {
      const { port } = server.address();
      const hostname = 'localhost';
      const protocol = https ? 'https' : 'http';
      const parts = { protocol, hostname, port, pathname };
      console.log(`[${name}] listening at ${format(parts)}`);
    }
  }
};
