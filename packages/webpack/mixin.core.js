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
    this.assets = new Resolvable();
  }
  loadAssetManifest() {
    const { serverDir, assetFile } = this.config;
    const path = join(serverDir, assetFile);
    return exists(path) ? require(path) : {};
  }
  loadRenderMiddleware() {
    const { serverDir, serverFile, assetFile } = this.config;
    const server = join(serverDir, serverFile);
    const assetManifest = join(serverDir, assetFile);
    this.assets.resolve(exists(assetManifest) ? require(assetManifest) : {});
    return exists(server) ? require(server) : (req, res, next) => next();
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
  createAssetDataMiddleware() {
    const createAssetDataMiddleware = require('./lib/middleware/assets');
    return createAssetDataMiddleware(this);
  }
  createRenderPlugin() {
    const RenderPlugin = require('./lib/plugins/render');
    return new RenderPlugin(this);
  }
  createAssetDataPlugin() {
    const AssetDataPlugin = require('./lib/plugins/assets');
    return new AssetDataPlugin(this);
  }
  createAssetManifestPlugin() {
    const { AssetManifestPlugin } = require('./lib/plugins/assets');
    return new AssetManifestPlugin(this);
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
      plugins.unshift(this.createAssetManifestPlugin());
    } else {
      plugins.unshift(this.createAssetDataPlugin());
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
      this.assets.resolve(this.loadAssetManifest());
    }
    middlewares.preroutes.push(this.createAssetDataMiddleware());
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
