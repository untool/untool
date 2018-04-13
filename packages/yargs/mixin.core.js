/* eslint-disable no-console */
const { sync: { pipe, override } } = require('mixinable');

const { Mixin } = require('@untool/core');

class YargsMixin extends Mixin {
  registerCommands(yargs, chalk) {
    const levels = ['debug', 'info', 'warn', 'error', 'silent'];
    const index = levels.indexOf(yargs.alias('l', 'log').argv.log);
    this.levels = levels.slice(Math.max(index, 0), -1);
    this.chalk = chalk;
    return yargs;
  }
  logDebug(...args) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('debug')) {
      console.log(this.chalk.bold(`${namespace} debug`));
      console.debug(...args);
    }
  }
  logInfo(...args) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('info')) {
      console.log(this.chalk.bold(`${namespace} info`));
      console.info(...args);
    }
  }
  logWarn(...args) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('warn')) {
      console.log(this.chalk.yellow.bold(`${namespace} warn`));
      console.warn(...args);
    }
  }
  logError(error) {
    const { namespace } = this.config;
    if (!this.levels || this.levels.includes('error')) {
      console.log(this.chalk.red.bold(`${namespace} error`));
      console.error(error.stack ? error.stack.toString() : error.toString());
    }
  }
  logStats(stats) {
    const { namespace } = this.config;
    if (this.levels && this.levels.includes('info')) {
      console.log(this.chalk.bold(`${namespace} stats`));
      console.info(
        stats.toString({ chunks: false, modules: false, entrypoints: false })
      );
    }
  }
}

YargsMixin.strategies = {
  registerCommands: pipe,
  logDebug: override,
  logInfo: override,
  logWarn: override,
  logError: override,
  logStats: override,
};

module.exports = YargsMixin;
