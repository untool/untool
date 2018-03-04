#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const chalk = require('chalk');

if (yargs.alias('p', 'production').argv.production) {
  process.env.NODE_ENV = 'production';
}
const { bootstrap } = require('@untool/core');

module.exports = (customYargs, customChalk) => {
  const { registerCommands, logError } = bootstrap();
  const onError = error => void logError(error) || process.exit(1);
  process.on('uncaughtException', onError);
  process.on('unhandledRejection', onError);
  registerCommands(
    customYargs ||
      yargs
        .version(require('./package.json').version)
        .alias('v', 'version')
        .usage('Usage: $0 <command> [options]')
        .help('help')
        .alias('h', 'help')
        .locale('en')
        .strict()
        .demandCommand(1, ''),
    customChalk || chalk
  ); /*.parse();*/
};

if (require.main === module) {
  module.exports();
}
