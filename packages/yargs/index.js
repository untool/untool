#!/usr/bin/env node
'use strict';

const createYargs = require('yargs');
const chalk = require('chalk');

const { bootstrap } = require('@untool/core');

exports.run = (...argv) => {
  const yargs = argv.length ? createYargs(argv) : createYargs;
  if (yargs.argv.production || yargs.argv.p) {
    process.env.NODE_ENV = 'production';
  }
  const { registerCommands, registerLogLevels, logError } = bootstrap();

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
      .demandCommand(1, ''),
    chalk
  );

  registerLogLevels(yargs.alias('l', 'log').argv);
};

if (require.main === module) {
  exports.run();
}
