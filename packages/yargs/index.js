'use strict';

const createYargs = require('yargs');

const { bootstrap } = require('@untool/core');

const configure = (config = {}) =>
  Object.assign(exports, {
    run(...args) {
      try {
        const yargs = args.length ? createYargs(args) : createYargs;
        if (yargs.argv.production || yargs.argv.p) {
          process.env.NODE_ENV = 'production';
        }
        const { registerCommands, handleArguments, handleError } = bootstrap(
          config
        );
        if (!(registerCommands && handleArguments && handleError)) {
          throw new Error("Can't use @untool/yargs mixin");
        }
        process.on('uncaughtException', handleError);
        process.on('unhandledRejection', handleError);
        process.nextTick(() =>
          registerCommands(
            yargs
              .version(false)
              .usage('Usage: $0 <command> [options]')
              .help('h')
              .alias('help', 'h')
              .locale('en')
              .strict()
              .demandCommand(1, '')
              .check(handleArguments)
          ).parse()
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error.stack ? error.stack.toString() : error.toString());
        process.exit(1);
      }
    },
    configure,
  });
configure();
