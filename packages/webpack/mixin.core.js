const { sync: { pipe, sequence } } = require('mixinable');

const ExpressMixin = require('@untool/express/mixin.core');

class WebpackMixin extends ExpressMixin {
  createAssetsMiddleware() {
    const assetsMiddleware = require('./lib/middleware/assets');
    const { config, assets, assetsByChunkName } = this;
    return assetsMiddleware(config, { assets, assetsByChunkName });
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
        logLevel: 'warn',
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
    const { render } = this;
    return new RenderPlugin(render);
  }
  getConfig(target) {
    const getConfig = require(`./lib/configs/${target}`);
    const { configureWebpack } = this.core;
    return getConfig(this.config, this.getAssetPath, (...args) =>
      configureWebpack(...args, target)
    );
  }
  clean() {
    const rimraf = require('rimraf');
    const { buildDir } = this.config;
    return new Promise((resolve, reject) =>
      rimraf(buildDir, error => (error ? reject(error) : resolve()))
    );
  }
  build() {
    const webpack = require('webpack');
    const { core, options: { static: isStatic }, getConfig } = this;
    const config = isStatic
      ? getConfig('build')
      : [getConfig('build'), getConfig('node')];
    return new Promise((resolve, reject) =>
      webpack(config).run(
        (error, stats) => (error ? reject(error) : resolve(stats))
      )
    ).then(stats => void core.inspectBuild(stats, config) || stats);
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
  initializeServer(app, mode) {
    if (this.options._ && mode === 'develop') {
      app.use(...this.createDevWebpackMiddlewares());
    }
    app.use(this.createAssetsMiddleware());
  }
  optimizeServer(app, mode) {
    if (this.options._) {
      if (mode === 'develop') {
        app.use(this.createDevRenderMiddleware());
      }
      if (mode === 'static') {
        app.use(this.createRenderMiddleware());
      }
    }
  }
  registerCommands(yargs) {
    const { namespace } = this.config;
    return yargs
      .command({
        command: 'start',
        describe: `Build and serve ${namespace}`,
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
        handler: argv => {
          const { logStats, logError } = this.core;
          Object.assign(this.options, argv);
          if (argv.production) {
            Promise.resolve(argv.clean && this.clean())
              .then(() => this.build())
              .then(logStats)
              .then(() => this.runServer(argv))
              .catch(logError);
          } else {
            this.clean().then(() => this.runDevServer(argv));
          }
        },
      })
      .command({
        command: 'build',
        describe: `Build ${namespace}`,
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
        handler: argv => {
          const { logStats, logError } = this.core;
          Object.assign(this.options, argv);
          Promise.resolve(argv.clean && this.clean())
            .then(() => this.build())
            .then(logStats)
            .catch(logError);
        },
      })
      .command({
        command: 'develop',
        describe: `Serve ${namespace} in watch mode`,
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
        handler: argv => {
          Object.assign(this.options, argv);
          this.clean().then(() => this.runDevServer(argv));
        },
      });
  }
}

WebpackMixin.strategies = {
  configureWebpack: pipe,
  inspectBuild: sequence,
};

module.exports = WebpackMixin;
