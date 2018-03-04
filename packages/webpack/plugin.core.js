import { promisify } from 'util';

import { pipe, parallel } from 'mixinable';

import Plugin from '@untool/express/plugin.core';

export default class WebpackPlugin extends Plugin {
  createAssetsMiddleware() {
    const assetsMiddleware = require('./lib/middleware/assets').default;
    const { config, assets, assetsByChunkName } = this;
    return assetsMiddleware(config, { assets, assetsByChunkName });
  }
  createRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render').default;
    const webpackConfig = this.getConfig('node');
    return renderMiddleware(webpackConfig);
  }
  createDevRenderMiddleware() {
    const renderMiddleware = require('./lib/middleware/render').default;
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
      require('webpack-hot-middleware')(compiler),
      (req, res, next) => {
        res.locals.noRewrite = req.url === '/__webpack_hmr';
        next();
      },
    ];
  }
  createAssetsPlugin() {
    const AssetsPlugin = require('./lib/plugins/assets').default;
    const { options, config, setAssets } = this;
    return new AssetsPlugin(options, config, setAssets);
  }
  createRenderPlugin() {
    const RenderPlugin = require('./lib/plugins/render').default;
    const { render } = this;
    return new RenderPlugin(render);
  }
  getConfig(target) {
    const getConfig = require(`./lib/configs/${target}`).default;
    const { configureWebpack, enhanceWebpack } = this.core;
    return getConfig(
      this.config,
      this.getAssetPath,
      (...args) => configureWebpack(...args, target),
      (...args) => enhanceWebpack(...args, target)
    );
  }
  clean() {
    const { buildDir } = this.config;
    return promisify(require('rimraf'))(buildDir);
  }
  build() {
    const { options: { static: isStatic }, getConfig } = this;
    return new Promise((resolve, reject) => {
      require('webpack')(
        isStatic ? getConfig('build') : [getConfig('build'), getConfig('node')]
      ).run((error, stats) => (error ? reject(error) : resolve(stats)));
    });
  }
  render() {
    const index = require('directory-index');
    const render = this.createRenderer();
    const { basePath, locations } = this.config;
    const { resolveAbsolute, resolveRelative } = this.uri;
    return Promise.resolve().then(() => {
      return Promise.all(
        locations
          .map(location => resolveAbsolute(basePath, location))
          .map(location => render(location))
      ).then(responses =>
        responses.reduce((result, response, i) => {
          const key = resolveRelative(basePath, index(locations[i]));
          return { ...result, [key]: response };
        }, {})
      );
    });
  }
  getAssetPath(filePath) {
    const { config: { assetPath } } = this;
    const { uri: { resolveRelative } } = Plugin;
    return resolveRelative(assetPath, filePath);
  }
  setAssets(assets, assetsByChunkName) {
    return Object.assign(this, { assets, assetsByChunkName });
  }
  registerCommands(yargs) {
    const { namespace } = this.config;
    return yargs
      .command({
        command: 'start',
        describe: `Builds and serves ${namespace}`,
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
            describe: 'Rewrite requests to statically built locations',
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
        describe: `Builds ${namespace}`,
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
        describe: `Serves ${namespace} in watch mode`,
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
            describe: 'Rewrite requests to statically built locations',
            type: 'boolean',
          },
        },
        handler: argv => {
          Object.assign(this.options, argv);
          this.clean().then(() => this.runDevServer(argv));
        },
      });
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
    if (mode === 'develop') {
      app.use(...this.createDevWebpackMiddlewares());
    }
    app.use(this.createAssetsMiddleware());
  }
  optimizeServer(app, mode) {
    if (mode === 'develop') {
      app.use(this.createDevRenderMiddleware());
    }
    if (mode === 'static') {
      app.use(this.createRenderMiddleware());
    }
  }
}

WebpackPlugin.hooks = {
  configureWebpack: pipe,
  enhanceWebpack: parallel,
};
