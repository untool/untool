import BuildCommandPlugin from '../command-build/plugin.core';

export default class StartCommandPlugin extends BuildCommandPlugin {
  registerCommands(yargs) {
    return yargs.command({
      command: 'start',
      describe: 'Builds and serves entire application',
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
        rewrite: {
          alias: 'r',
          default: true,
          describe: 'Rewrite requests to statically built locations',
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
        if (this.options.production) {
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
            .then(() => this.utils.runServer(this.options))
            .catch(this.core.logError);
        } else {
          this.utils.clean(this.config.buildDir).then(() =>
            this.utils.runDevServer({
              ...this.options,
              webpackBrowserConfig: this.utils.webpackConfig.develop,
              webpackNodeConfig: this.utils.webpackConfig.node,
            })
          );
        }
      },
    });
  }
}
