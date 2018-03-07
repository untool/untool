#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const chalk = require('chalk');

if (yargs.argv.production || yargs.argv.p) {
  process.env.NODE_ENV = 'production';
}
const { bootstrap } = require('@untool/core');

exports.run = (customArgv, customYargs, customChalk) => {
  const { registerCommands, logError } = bootstrap();
  const onError = error => void logError(error) || process.exit(1);
  process.on('uncaughtException', onError);
  process.on('unhandledRejection', onError);
  registerCommands(
    customYargs ||
      yargs
        .version(require('./package.json').version)
        .usage('Usage: $0 <command> [options]')
        .help('h')
        .alias('help', 'h')
        .locale('en')
        .strict()
        .demandCommand(1, ''),
    customChalk || chalk
  ).parse(customArgv || process.argv);
};

if (require.main === module) {
  exports.run();
}
