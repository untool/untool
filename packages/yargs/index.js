#!/usr/bin/env node
'use strict';

const createYargs = require('yargs');

const { bootstrap } = require('@untool/core');

exports.run = (overrides, ...args) => {
  try {
    const yargs = args.length ? createYargs(args) : createYargs;
    if (yargs.argv.production || yargs.argv.p) {
      process.env.NODE_ENV = 'production';
    }
    const { registerCommands, handleArguments, handleError } = bootstrap(
      overrides
    );
    if (!(registerCommands && handleArguments && handleError)) {
      throw new Error("Can't use @untool/yargs mixin");
    }
    process.on('uncaughtException', handleError);
    process.on('unhandledRejection', handleError);
    process.nextTick(() =>
      registerCommands(
        yargs
          .version(require('./package.json').version)
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
};

if (require.main === module) {
  exports.run();
}
