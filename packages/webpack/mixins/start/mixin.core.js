'use strict';

const { Mixin } = require('@untool/core');

class WebpackStartMixin extends Mixin {
  registerCommands(yargs) {
    console.log(new Date(), 'WebpackStartMixin: registerCommands hook called');
    const { name } = this.config;
    yargs.command(
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
          clean: {
            alias: 'c',
            default: true,
            describe: 'Clean up before building',
            type: 'boolean',
          },
        },
        handler: (argv) => {
          if (process.env.NODE_ENV === 'production') {
            console.log(
              new Date(),
              'WebpackStartMixin: start -p handler executed'
            );
            Promise.resolve(argv.clean && this.clean())
              .then(() => {
                console.log(
                  new Date(),
                  'WebpackStartMixin: finished cleaning - starting build'
                );
                return this.build();
              })
              .then(() => {
                console.log(
                  new Date(),
                  'WebpackStartMixin: finished build - starting server'
                );
                return this.runServer('serve');
              })
              .catch(this.handleError);
          } else {
            this.clean()
              .then(() => this.runServer('develop'))
              .catch(this.handleError);
          }
        },
      })
    );
  }
}

module.exports = WebpackStartMixin;
