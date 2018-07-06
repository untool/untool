const { existsSync: exists } = require('fs');
const { join } = require('path');

const debug = require('debug')('untool:webpack:stats');
const {
  sync: { pipe, sequence },
  async: { override },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class WebpackMixin extends Mixin {
  loadRenderMiddleware() {
    const { buildDir, serverFile } = this.config;
    const path = join(buildDir, serverFile);
    return exists(path) ? require(path) : (req, res, next) => next();
  }
  createRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render');
    const webpackConfig = this.createConfig('node');
    return renderMiddleware(webpackConfig);
  }
  createDevRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render');
    const browserConfig = this.createConfig('develop');
    const nodeConfig = this.createConfig('node');
    return renderMiddleware({
      ...nodeConfig,
      watchOptions: nodeConfig.watchOptions || browserConfig.watchOptions,
    });
  }
  createAssetsMiddleware() {
    const assetsMiddleware = require('./lib/middleware/assets');
    const { config, assets, assetsByChunkName } = this;
    return assetsMiddleware(config, { assets, assetsByChunkName });
  }
  createDevAssetsMiddlewares() {
    const browserConfig = this.createConfig('develop');
    const compiler = require('webpack')(browserConfig);
    return [
      require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        logLevel: 'silent',
        publicPath: browserConfig.output.publicPath,
        watchOptions: browserConfig.watchOptions,
        serverSideRender: true,
      }),
      require('webpack-hot-middleware')(compiler, { log: false }),
    ];
  }
  createRenderPlugin() {
    const RenderPlugin = require('./lib/plugins/render');
    const { renderLocations } = this;
    return new RenderPlugin(renderLocations);
  }
  createAssetsPlugin() {
    const AssetsPlugin = require('./lib/plugins/assets');
    const { options, config } = this;
    return new AssetsPlugin(options, config, (assets, assetsByChunkName) =>
      Object.assign(this, { assets, assetsByChunkName })
    );
  }
  createConfig(target) {
    const createConfig = require(`./lib/configs/${target}`);
    const { configureBuild } = this;
    return createConfig(this.config, (...args) =>
      configureBuild(...args, target)
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
      createConfig,
      inspectBuild,
    } = this;
    const config = isStatic
      ? createConfig('build')
      : [createConfig('build'), createConfig('node')];
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
    if (target !== 'node') {
      plugins.unshift(this.createAssetsPlugin());
    }
    return webpackConfig;
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'develop') {
      middlewares.initial.push(this.createDevAssetsMiddlewares());
      middlewares.routes.push(this.createDevRenderMiddleware());
    }
    if (mode === 'static') {
      middlewares.routes.push(this.createRenderMiddleware());
    }
    if (mode === 'serve') {
      middlewares.routes.push(this.loadRenderMiddleware());
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
          builder: {
            static: {
              alias: 's',
              default: false,
              describe: 'Statically build locations',
              type: 'boolean',
            },
          },
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
  build: override,
  clean: override,
};

module.exports = WebpackMixin;
