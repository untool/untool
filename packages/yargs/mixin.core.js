/* eslint-disable no-console */
import { pipe, override } from 'mixinable';

import { Mixin } from '@untool/core';

export default class YargsMixin extends Mixin {
  registerCommands(yargs, chalk) {
    const levels = ['info', 'warn', 'error', 'silent'];
    const index = levels.indexOf(yargs.alias('l', 'log').argv.log);
    this.levels = levels.slice(Math.max(index, 0), -1);
    this.chalk = chalk;
    return yargs;
  }
  logInfo(...args) {
    if (this.levels && this.levels.includes('info')) {
      console.log(this.chalk.bold('untool info'));
      console.info(...args);
    }
  }
  logWarn(...args) {
    if (this.levels && this.levels.includes('warn')) {
      console.log(this.chalk.yellow.bold('untool warn'));
      console.warn(...args);
    }
  }
  logError(error) {
    if (!this.levels || this.levels.includes('error')) {
      console.log(this.chalk.red.bold('untool error'));
      console.error(error.stack ? error.stack.toString() : error.toString());
    }
  }
  logStats(stats) {
    if (this.levels && this.levels.includes('info')) {
      console.log(this.chalk.bold('untool stats'));
      console.info(
        stats.toString({ chunks: false, modules: false, entrypoints: false })
      );
    }
  }
}

YargsMixin.strategies = {
  registerCommands: pipe,
  logInfo: override,
  logWarn: override,
  logError: override,
  logStats: override,
};
