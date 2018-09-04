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
  loadPrebuiltAssets() {
    const { serverDir, assetFile } = this.config;
    const path = join(serverDir, assetFile);
    return exists(path) ? require(path) : {};
  }
  loadPrebuiltMiddleware() {
    const { serverDir, serverFile } = this.config;
    const path = join(serverDir, serverFile);
    return exists(path) ? require(path) : (req, res, next) => next();
  }
  createAssetsMiddleware() {
    const assetsMiddleware = require('./lib/middleware/assets');
    const { assets } = this;
    return assetsMiddleware(assets);
  }
  createRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render');
    const webpackConfig = this.getBuildConfig('node');
    return renderMiddleware(webpackConfig);
  }
  createDevRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render');
    const webpackBrowserConfig = this.getBuildConfig('develop');
    const webpackNodeConfig = this.getBuildConfig('node');
    return renderMiddleware({
      ...webpackNodeConfig,
      watchOptions:
        webpackNodeConfig.watchOptions || webpackBrowserConfig.watchOptions,
    });
  }
  createDevWebpackMiddlewares() {
    const webpackBrowserConfig = this.getBuildConfig('develop');
    const compiler = require('webpack')(webpackBrowserConfig);
    return [
      require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        logLevel: 'silent',
        publicPath: webpackBrowserConfig.output.publicPath,
        watchOptions: webpackBrowserConfig.watchOptions,
      }),
      require('webpack-hot-middleware')(compiler, { log: false }),
    ];
  }
  createRenderPlugin() {
    const RenderPlugin = require('./lib/plugins/render');
    const { renderLocations } = this;
    return new RenderPlugin(renderLocations);
  }
  createAssetsPlugin(target) {
    const AssetsPlugin = require('./lib/plugins/assets');
    const { assets, config } = this;
    return new AssetsPlugin(assets, config, target);
  }
  getBuildConfig(target) {
    const getConfig = require(`./lib/configs/${target}`);
    const { configureBuild } = this;
    return getConfig(this.config, (...args) => configureBuild(...args, target));
  }
  clean() {
    const rimraf = require('rimraf');
    const { buildDir, serverDir } = this.config;
    return Promise.all(
      [buildDir, serverDir].map(
        (dir) =>
          new Promise((resolve, reject) =>
            rimraf(dir, (error) => (error ? reject(error) : resolve()))
          )
      )
    );
  }
  build() {
    const webpack = require('webpack');
    const {
      options: { static: isStatic },
      getBuildConfig,
      inspectBuild,
    } = this;
    const config = isStatic
      ? getBuildConfig('build')
      : [getBuildConfig('build'), getBuildConfig('node')];
    return new Promise((resolve, reject) =>
      webpack(config).run(
        (error, stats) => (error ? reject(error) : resolve(stats))
      )
    ).then((stats) => void inspectBuild(stats, config) || stats);
  }
  configureBuild(webpackConfig, loaderConfigs, target) {
    const { plugins } = webpackConfig;
    if (this.options.static && target === 'build') {
      plugins.unshift(this.createRenderPlugin());
    }
    plugins.unshift(this.createAssetsPlugin(target));
    return webpackConfig;
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'develop') {
      middlewares.initial.push(this.createDevWebpackMiddlewares());
      middlewares.routes.push(this.createDevRenderMiddleware());
    }
    if (mode === 'static') {
      middlewares.routes.push(this.createRenderMiddleware());
    }
    if (mode === 'serve') {
      this.assets.resolve(this.loadPrebuiltAssets());
      middlewares.routes.push(this.loadPrebuiltMiddleware());
    }
    middlewares.preroutes.push(this.createAssetsMiddleware());
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
