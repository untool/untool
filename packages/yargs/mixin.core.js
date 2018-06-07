/* eslint-disable no-console */
const chalk = require('chalk');

const {
  sync: { pipe, sequence, override },
} = require('mixinable');

const { Mixin } = require('@untool/core');

class YargsMixin extends Mixin {
  registerCommands(yargs) {
    return yargs.option('log', {
      alias: 'l',
      default: 'info',
      describe: 'Define log level',
      type: 'string',
    });
  }
  handleArguments(argv) {
    const levels = ['debug', 'info', 'warn', 'error', 'silent'];
    const index = levels.indexOf(argv.log);
    this.levels = levels.slice(Math.max(index, 0), -1);
  }
  handleError(error) {
    this.logError(error);
    process.exit(1);
  }
  logDebug(...args) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('debug')) {
      console.log(chalk.bold(`${namespace} debug`));
      console.debug(...args);
    }
  }
  logInfo(...args) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('info')) {
      console.log(chalk.bold(`${namespace} info`));
      console.info(...args);
    }
  }
  logWarn(...args) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('warn')) {
      console.log(chalk.yellow.bold(`${namespace} warn`));
      console.warn(...args);
    }
  }
  logError(error) {
    const { namespace } = this.config;
    if (!this.levels || this.levels.includes('error')) {
      console.log(chalk.red.bold(`${namespace} error`));
      console.error(error.stack ? error.stack.toString() : error.toString());
    }
  }
  logStats(stats) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('info')) {
      console.log(chalk.bold(`${namespace} stats`));
      console.info(
        stats.toString({ chunks: false, modules: false, entrypoints: false })
      );
    }
  }
}

YargsMixin.strategies = {
  registerCommands: pipe,
  handleArguments: sequence,
  handleError: override,
  logDebug: override,
  logInfo: override,
  logWarn: override,
  logError: override,
  logStats: override,
};

module.exports = YargsMixin;
