#!/usr/bin/env node
'use strict';

const createYargs = require('yargs');

const { initialize } = require('@untool/core');

const configure = (config, options) => ({
  run(...args) {
    try {
      const yargs = args.length ? createYargs(args) : createYargs;
      if (yargs.argv.production || yargs.argv.p) {
        process.env.NODE_ENV = 'production';
      }
      const core = initialize(config, options);
      const { registerCommands, handleArguments, handleError } = core;
      if (!(registerCommands && handleArguments && handleError)) {
        throw new Error("Can't use @untool/yargs mixin");
      }
      process.on('uncaughtException', handleError);
      process.on('unhandledRejection', handleError);
      process.nextTick(() => {
        registerCommands(
          yargs
            .version(false)
            .usage('Usage: $0 <command> [options]')
            .alias('help', 'h')
            .locale('en')
            .strict()
            .demandCommand(1, '')
            .check(handleArguments)
        );
        yargs.parse();
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error.stack ? error.stack.toString() : error.toString());
      process.exit(1);
    }
  },
  configure,
});

module.exports = configure();

if (require.main === module) {
  module.exports.run();
}
