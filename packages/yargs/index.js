#!/usr/bin/env node
'use strict';

const createYargs = require('yargs');

const { bootstrap } = require('@untool/core');

exports.run = (...args) => {
  const yargs = args.length ? createYargs(args) : createYargs;
  if (yargs.argv.production || yargs.argv.p) {
    process.env.NODE_ENV = 'production';
  }
  const { registerCommands, handleArguments, logError } = bootstrap();

  const onError = error => void logError(error) || process.exit(1);
  process.on('uncaughtException', onError);
  process.on('unhandledRejection', onError);

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
  ).parse();
};

if (require.main === module) {
  exports.run();
}
