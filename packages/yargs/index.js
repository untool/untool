#!/usr/bin/env node
'use strict';

const createYargs = require('yargs');

const { initialize } = require('@untool/core');

const configure = (config, options) => ({
  run(...args) {
    try {
      const yargs = args.length ? createYargs(args) : createYargs;
      const { argv } = yargs.help(false);
      if (argv.production || argv.p) {
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
            .usage('Usage: $0 <command> [options]')
            .locale('en')
            .version(false)
            .help(true)
            .alias('help', 'h')
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

if (require.main === module) {
  const { join } = require('path');
  module.exports = configure({ mixins: [join(__dirname, 'mixins', 'log')] });
  module.exports.run();
} else {
  module.exports = configure();
}
