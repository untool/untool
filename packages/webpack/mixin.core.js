'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

const debug = require('debug')('untool:webpack:stats');
const {
  sync: { pipe, sequence, callable: callableSync },
  async: { callable: callableAsync },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const { Resolvable } = require('./lib/utils/resolvable');

class WebpackMixin extends Mixin {
  constructor(...args) {
    super(...args);
    this.stats = new Resolvable();
  }
  loadRenderMiddleware() {
    const { serverDir, serverFile, statsFile } = this.config;
    const serverFilePath = join(serverDir, serverFile);
    const statsFilePath = join(serverDir, statsFile);
    this.stats.resolve(exists(statsFilePath) ? require(statsFilePath) : {});
    if (exists(serverFilePath)) {
      return require(serverFilePath);
    } else {
      return (req, res, next) => next();
    }
  }
  createRenderMiddleware() {
    const createRenderMiddleware = require('./lib/middleware/render');
    const webpackConfig = this.getBuildConfig('node');
    return createRenderMiddleware(webpackConfig);
  }
  createRenderWatchMiddleware() {
    const createRenderMiddleware = require('./lib/middleware/render');
    const webpackConfig = this.getBuildConfig('node');
    const { watchOptions } = this.getBuildConfig('develop');
    return createRenderMiddleware({ watchOptions, ...webpackConfig });
  }
  createStatsMiddleware() {
    const createStatsMiddleware = require('./lib/middleware/stats');
    return createStatsMiddleware(this);
  }
  createWebpackMiddlewares() {
    const webpackConfig = this.getBuildConfig('develop');
    const compiler = require('webpack')(webpackConfig);
    return [
      require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        logLevel: 'silent',
        publicPath: webpackConfig.output.publicPath,
        watchOptions: webpackConfig.watchOptions,
      }),
      require('webpack-hot-middleware')(compiler, { log: false }),
    ];
  }
  createRenderPlugin() {
    const RenderPlugin = require('./lib/plugins/render');
    return new RenderPlugin(this);
  }
  createStatsPlugin() {
    const { StatsPlugin } = require('./lib/plugins/stats');
    return new StatsPlugin(this);
  }
  createStatsFilePlugin() {
    const { StatsFilePlugin } = require('./lib/plugins/stats');
    return new StatsFilePlugin(this);
  }
  getBuildConfig(target) {
    const getConfig = require(`./lib/configs/${target}`);
    const { configureBuild, config } = this;
    return getConfig(config, (...args) => configureBuild(...args, target));
  }
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
    const { options, getBuildConfig, inspectBuild } = this;
    const webpackConfig = (({ static: isStatic }) => {
      if (isStatic) {
        return getBuildConfig('build');
      } else {
        return [getBuildConfig('build'), getBuildConfig('node')];
      }
    })(options);
    return new Promise((resolve, reject) =>
      webpack(webpackConfig).run(
        (error, stats) => (error ? reject(error) : resolve(stats))
      )
    ).then((stats) => void inspectBuild(stats, webpackConfig) || stats);
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { plugins } = webpackConfig;
    if (this.options.static && target === 'build') {
      plugins.unshift(this.createRenderPlugin());
    }
    if (target === 'node') {
      plugins.unshift(this.createStatsFilePlugin());
    } else {
      plugins.unshift(this.createStatsPlugin());
    }
    return webpackConfig;
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'develop') {
      middlewares.initial.push(this.createWebpackMiddlewares());
      middlewares.routes.push(this.createRenderWatchMiddleware());
    }
    if (mode === 'static') {
      middlewares.routes.push(this.createRenderMiddleware());
    }
    if (mode === 'serve') {
      middlewares.routes.push(this.loadRenderMiddleware());
    }
    middlewares.preroutes.push(this.createStatsMiddleware());
    return app;
  }
  registerCommands(yargs) {
    const { name } = this.config;
    return yargs
      .command(
        this.configureCommand({
          command: 'start',
          describe: `Build and serve ${name}`,
          builder: {
            production: {
              alias: 'p',
              default: false,
              describe: 'Enable production mode',
              type: 'boolean',
            },
            static: {
              alias: 's',
              default: false,
              describe: 'Statically build locations',
              type: 'boolean',
            },
            clean: {
              alias: 'c',
              default: true,
              describe: 'Clean up before building',
              type: 'boolean',
            },
          },
          handler: (argv) => {
            if (argv.production) {
              Promise.resolve(argv.clean && this.clean())
                .then(this.build)
                .then(this.runServer.bind(this, 'serve'))
                .catch(this.handleError);
            } else {
              this.clean()
                .then(this.runServer.bind(this, 'develop'))
                .catch(this.handleError);
            }
          },
        })
      )
      .command(
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
            static: {
              alias: 's',
              default: false,
              describe: 'Statically build locations',
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
      )
      .command(
        this.configureCommand({
          command: 'develop',
          describe: `Serve ${name} in watch mode`,
          builder: {},
          handler: () =>
            this.clean()
              .then(this.runServer.bind(this, 'develop'))
              .catch(this.handleError),
        })
      );
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
  inspectBuild(stats) {
    debug(
      stats.toString({ chunks: false, modules: false, entrypoints: false })
    );
  }
}

WebpackMixin.strategies = {
  configureBuild: pipe,
  inspectBuild: sequence,
  getBuildConfig: callableSync,
  build: callableAsync,
  clean: callableAsync,
};

module.exports = WebpackMixin;
