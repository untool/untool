const { existsSync: exists } = require('fs');
const { join } = require('path');

const {
  sync: { pipe, sequence },
  async: { override },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class WebpackMixin extends Mixin {
  createAssetsMiddleware() {
    const assetsMiddleware = require('./lib/middleware/assets');
    const { config, assets, assetsByChunkName } = this;
    return assetsMiddleware(config, { assets, assetsByChunkName });
  }
  loadPrebuiltMiddleware() {
    const { buildDir, serverFile } = this.config;
    const path = join(buildDir, serverFile);
    return exists(path) ? require(path) : (req, res, next) => next();
  }
  createRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render');
    const webpackConfig = this.getConfig('node');
    return renderMiddleware(webpackConfig);
  }
  createDevRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render');
    const webpackBrowserConfig = this.getConfig('develop');
    const webpackNodeConfig = this.getConfig('node');
    return renderMiddleware({
      ...webpackNodeConfig,
      watchOptions:
        webpackNodeConfig.watchOptions || webpackBrowserConfig.watchOptions,
    });
  }
  createDevWebpackMiddlewares() {
    const webpackBrowserConfig = this.getConfig('develop');
    const compiler = require('webpack')(webpackBrowserConfig);
    return [
      require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        logLevel: 'silent',
        publicPath: webpackBrowserConfig.output.publicPath,
        watchOptions: webpackBrowserConfig.watchOptions,
        serverSideRender: true,
      }),
      require('webpack-hot-middleware')(compiler, { log: false }),
      (req, res, next) => {
        res.locals.noRewrite = req.url === '/__webpack_hmr';
        next();
      },
    ];
  }
  createAssetsPlugin() {
    const AssetsPlugin = require('./lib/plugins/assets');
    const { options, config } = this;
    return new AssetsPlugin(options, config, (assets, assetsByChunkName) =>
      Object.assign(this, { assets, assetsByChunkName })
    );
  }
  createRenderPlugin() {
    const RenderPlugin = require('./lib/plugins/render');
    const { renderLocations } = this;
    return new RenderPlugin(renderLocations);
  }
  getConfig(target) {
    const getConfig = require(`./lib/configs/${target}`);
    const { configureWebpack } = this;
    return getConfig(this.config, (...args) =>
      configureWebpack(...args, target)
    );
  }
  clean() {
    const rimraf = require('rimraf');
    const { buildDir } = this.config;
    return new Promise((resolve, reject) =>
      rimraf(buildDir, (error) => (error ? reject(error) : resolve()))
    );
  }
  build() {
    const webpack = require('webpack');
    const {
      options: { static: isStatic },
      getConfig,
      inspectBuild,
    } = this;
    const config = isStatic
      ? getConfig('build')
      : [getConfig('build'), getConfig('node')];
    return new Promise((resolve, reject) =>
      webpack(config).run(
        (error, stats) => (error ? reject(error) : resolve(stats))
      )
    ).then((stats) => void inspectBuild(stats, config) || stats);
  }
  configureWebpack(webpackConfig, loaderConfigs, target) {
    const { plugins } = webpackConfig;
    if (this.options.static && target === 'build') {
      plugins.unshift(this.createRenderPlugin());
    }
    if (target !== 'node') {
      plugins.unshift(this.createAssetsPlugin());
    }
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
      middlewares.routes.push(this.loadPrebuiltMiddleware());
    }
    middlewares.preroutes.push(this.createAssetsMiddleware());
    return app;
  }
  registerCommands(yargs) {
    const { name } = this.config;
    return yargs
      .command({
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
          rewrite: {
            alias: 'r',
            default: true,
            describe: 'Rewrite to static locations',
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
      .command({
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
      .command({
        command: 'develop',
        describe: `Serve ${name} in watch mode`,
        builder: {
          static: {
            alias: 's',
            default: false,
            describe: 'Statically build locations',
            type: 'boolean',
          },
          rewrite: {
            alias: 'r',
            default: true,
            describe: 'Rewrite to static locations',
            type: 'boolean',
          },
        },
        handler: () =>
          this.clean()
            .then(this.runServer.bind(this, 'develop'))
            .catch(this.handleError),
      });
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

WebpackMixin.strategies = {
  configureWebpack: pipe,
  inspectBuild: sequence,
  build: override,
  clean: override,
};

module.exports = WebpackMixin;
