import { RawSource } from 'webpack-sources';

import Plugin from '../core';

export default class BuildCommandPlugin extends Plugin {
  registerCommands(yargs) {
    return yargs.command({
      command: 'build',
      describe: 'Builds the browser and server JS bundles',
      builder: {
        production: {
          alias: 'p',
          default: false,
          describe: 'Minify output and disable developer warnings',
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
          describe: 'Clean up artifacts in build directory before building',
          type: 'boolean',
        },
      },
      handler: argv => {
        this.options = argv;
        Promise.resolve(
          this.options.clean ? this.utils.clean(this.config.buildDir) : null
        )
          .then(() =>
            this.utils.build({
              ...this.options,
              webpackBrowserConfig: this.utils.webpackConfig.build,
              webpackNodeConfig: this.utils.webpackConfig.node,
            })
          )
          .then(this.core.logStats)
          .catch(this.core.logError);
      },
    });
  }
  enhanceWebpack(compiler, target) {
    if (this.options._ && target === 'build') {
      compiler.hooks.emit.tapPromise('untool-build', compilation =>
        Promise.resolve().then(() => {
          this.assets = Object.keys(compilation.assets);
          this.assetsByChunkName = Array.from(
            compilation.namedChunks.keys()
          ).reduce(
            (result, key) => ({
              ...result,
              [key]: compilation.namedChunks.get(key).files,
            }),
            {}
          );
          if (this.options.static) {
            return this.utils
              .render({
                webpackNodeConfig: this.utils.webpackConfig.node,
                locations: this.config.locations,
                basePath: this.config.basePath,
              })
              .then(pages => {
                Object.assign(
                  compilation.assets,
                  Object.keys(pages).reduce(
                    (result, key) => ({
                      ...result,
                      [key]: new RawSource(pages[key]),
                    }),
                    {}
                  )
                );
              });
          } else {
            compilation.assets[this.config.assetFile] = new RawSource(
              JSON.stringify({
                assets: this.assets,
                assetsByChunkName: this.assetsByChunkName,
              })
            );
            return Promise.resolve();
          }
        })
      );
    }
  }
  initializeServer(app) {
    if (this.options._ && this.options.static) {
      app.use((req, res, next) => {
        res.locals = {
          assets: this.assets,
          assetsByChunkName: this.assetsByChunkName,
        };
        next();
      });
    }
  }
}
