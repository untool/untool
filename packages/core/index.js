#!/usr/bin/env node
'use strict';

const main = require.main;

// eslint-disable-next-line no-global-assign
require = require('@std/esm')(module, {
  esm: 'js',
  cjs: { interop: true, namedExports: true, vars: true },
});

module.exports = exports = {
  initialize() {
    const yargs = require('yargs');
    if (yargs.alias('p', 'production').argv.production) {
      process.env.NODE_ENV = 'production';
    }
    const core = require('./lib/core').default;
    const pkgData = require('./package.json');
    process.on('uncaughtException', core.logError);
    process.on('unhandledRejection', core.logError);
    core
      .registerCommands(
        yargs
          .version(pkgData.version)
          .alias('v', 'version')
          .usage('Usage: $0 <command> [options]')
          .help('help')
          .alias('h', 'help')
          .locale('en')
          .strict()
          .demandCommand(1, '')
      )
      .parse();
  },
  get Plugin() {
    return require('./lib/plugins/core').default;
  },
  get core() {
    return require('./lib/core').default;
  },
  get config() {
    return require('./lib/config').default;
  },
  get build() {
    return require('./lib/utils/build').build;
  },
  get clean() {
    return require('./lib/utils/build').clean;
  },
  get render() {
    return require('./lib/utils/build').render;
  },
  get runServer() {
    return require('./lib/services/serve').default;
  },
  get runDevServer() {
    return require('./lib/services/develop').default;
  },
  get createStaticRenderer() {
    return require('./lib/services/static').default;
  },
  get createServer() {
    return require('./lib/services/serve').createServer;
  },
  get createDevServer() {
    return require('./lib/services/develop').createServer;
  },
  get resolve() {
    return require('./lib/utils/resolve');
  },
  get url() {
    return require('./lib/utils/url');
  },
  get webpack() {
    return require('./lib/webpack');
  },
  webpackConfig: {
    get build() {
      return require('./lib/configs/webpack.build').default;
    },
    get develop() {
      return require('./lib/configs/webpack.develop').default;
    },
    get node() {
      return require('./lib/configs/webpack.node').default;
    },
  },
};

if (module === main) {
  exports.initialize();
}
