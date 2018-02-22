import Plugin from '../core';

export default class ServeCommandPlugin extends Plugin {
  registerCommands(yargs) {
    return yargs.command({
      command: 'serve',
      describe: 'Starts a production server',
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
        this.options = argv;
        this.utils.runServer(this.options);
      },
    });
  }
}
