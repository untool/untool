import Plugin from '../core';

export default class DevelopCommandPlugin extends Plugin {
  registerCommands(yargs) {
    return yargs.command({
      command: 'develop',
      describe: 'Starts a development server featuring HMR',
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
        this.options = argv;
        this.utils.clean(this.config.buildDir).then(() =>
          this.utils.runDevServer({
            ...this.options,
            webpackBrowserConfig: this.utils.webpackConfig.develop,
            webpackNodeConfig: this.utils.webpackConfig.node,
          })
        );
      },
    });
  }
}
