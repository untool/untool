import { parallel } from 'mixinable';

import { Plugin } from '@untool/core';

import * as uri from './lib/uri';

export default class ExpressPlugin extends Plugin {
  runServer(options) {
    const { core, config } = this;
    return require('./lib/serve').default(options, core, config);
  }
  runDevServer(options) {
    const { core, config } = this;
    return require('./lib/develop').default(options, core, config);
  }
  createServer(options) {
    const { core, config } = this;
    return require('./lib/serve').createServer(options, core, config);
  }
  createDevServer(options) {
    const { core, config } = this;
    return require('./lib/develop').createServer(options, core, config);
  }
  createRenderer(options) {
    const { core, config } = this;
    return require('./lib/static').default(options, core, config);
  }
  registerCommands(yargs) {
    const { namespace } = this.config;
    return yargs.command({
      command: 'serve',
      describe: `Serves ${namespace}`,
      builder: {
        production: {
          alias: 'p',
          default: true,
          describe: 'Enable production mode',
          type: 'boolean',
        },
        static: {
          alias: 's',
          default: false,
          describe: 'Only serve statically built locations',
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
        this.runServer(argv);
      },
    });
  }
}

ExpressPlugin.uri = uri;
ExpressPlugin.hooks = {
  initializeServer: parallel,
  optimizeServer: parallel,
  finalizeServer: parallel,
};
