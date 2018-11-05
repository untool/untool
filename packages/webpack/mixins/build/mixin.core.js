'use strict';

const debug = require('debug')('untool:webpack:stats');

const {
  sync: { sequence },
  async: { callable },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class WebpackBuildMixin extends Mixin {
  clean() {
    const rimraf = require('rimraf');
    const { buildDir, serverDir } = this.config;
    return Promise.all([
      new Promise((resolve, reject) =>
        rimraf(buildDir, (error) => (error ? reject(error) : resolve()))
      ),
      new Promise((resolve, reject) =>
        rimraf(serverDir, (error) => (error ? reject(error) : resolve()))
      ),
    ]);
  }
  build() {
    const webpack = require('webpack');
    const webpackConfigs = [];
    this.collectBuildConfigs(webpackConfigs);
    return new Promise((resolve, reject) =>
      webpack(
        webpackConfigs.length === 1 ? webpackConfigs[0] : webpackConfigs
      ).run((error, stats) => {
        if (error) {
          reject(error);
        } else if (stats.hasErrors()) {
          const { errors } = stats.toJson();
          reject(new Error(`Can't compile:\n${errors.join('\n')}`));
        } else {
          resolve(stats);
        }
      })
    ).then((stats) => void this.inspectBuild(stats, webpackConfigs) || stats);
  }
  inspectBuild(stats) {
    debug(
      stats.toString({ chunks: false, modules: false, entrypoints: false })
    );
  }
  registerCommands(yargs) {
    const { name } = this.config;
    yargs.command(
      this.configureCommand({
        command: 'build',
        describe: `Build ${name}`,
        builder: {
          production: {
            alias: 'p',
            default: false,
            describe: 'Enable production mode',
            type: 'boolean',
          },
          clean: {
            alias: 'c',
            default: true,
            describe: 'Clean up before building',
            type: 'boolean',
          },
        },
        handler: (argv) =>
          Promise.resolve(argv.clean && this.clean())
            .then(this.build)
            .catch(this.handleError),
      })
    );
  }
}

WebpackBuildMixin.clean = callable;
WebpackBuildMixin.build = callable;
WebpackBuildMixin.inspectBuild = sequence;

module.exports = WebpackBuildMixin;
