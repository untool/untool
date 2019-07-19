'use strict';

const debug = require('debug')('untool:webpack:stats');

const {
  sync: { sequence },
  async: { callable },
} = require('mixinable');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

const {
  getHoistedVersionWarning,
  versionMismatchReporter,
} = require('../../lib/utils/validation');

class WebpackBuildMixin extends Mixin {
  clean() {
    const rimraf = require('rimraf');
    const { buildDir } = this.config;
    return new Promise((resolve, reject) =>
      rimraf(buildDir, (error) => (error ? reject(error) : resolve()))
    );
  }
  build() {
    const webpack = require('webpack');
    const webpackConfig = this.getBuildConfig('browser');
    return new Promise((resolve, reject) =>
      webpack(webpackConfig).run((error, stats) => {
        if (error) {
          reject(error);
        } else if (stats.hasErrors()) {
          const { errors } = stats.toJson({ all: false, errors: true });
          reject(new Error(`Build failed with ${errors.length} error(s)`));
        } else {
          resolve(stats);
        }
      })
    ).then((stats) => {
      this.inspectBuild(stats, webpackConfig);
      return stats;
    });
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
            .then(() => this.build())
            .catch(this.handleError),
      })
    );
  }
  diagnose({ detectDuplicatePackages, collectResults }) {
    detectDuplicatePackages('webpack');

    const { _workspace } = this.config;

    collectResults(
      versionMismatchReporter,
      ...[getHoistedVersionWarning(_workspace, __dirname, 'core-js')].filter(
        Boolean
      )
    );
  }
}

WebpackBuildMixin.strategies = {
  clean: validate(
    callable,
    ({ length }) => {
      invariant(length === 0, 'clean(): Received unexpected argument(s)');
    },
    (result, isAsync) => {
      invariant(isAsync, 'clean(): Did not return a Promise');
    }
  ),
  build: validate(
    callable,
    ({ length }) => {
      invariant(length === 0, 'build(): Received unexpected argument(s)');
    },
    (result, isAsync) => {
      invariant(isAsync, 'build(): Did not return a Promise');
    }
  ),
  inspectBuild: validate(sequence, ([stats]) => {
    invariant(
      stats && typeof stats.toString === 'function',
      'inspectBuild(): Received invalid Webpack Stats object'
    );
  }),
};

module.exports = WebpackBuildMixin;
