/* eslint-disable no-console */
import isCI from 'is-ci';
import chalk from 'chalk';

export default class ConsoleLoggerPlugin {
  logInfo(...args) {
    console.log(isCI ? '[untool info]' : chalk.bold('untool info'));
    console.info(...args);
  }
  logWarn(...args) {
    console.log(isCI ? '[untool warn]' : chalk.yellow.bold('untool warn'));
    console.warn(...args);
  }
  logError(error) {
    console.log(isCI ? '[untool error]' : chalk.red.bold('[untool error]'));
    console.error(error.stack ? error.stack.toString() : error.toString());
  }
  logStats(stats) {
    console.log(isCI ? '[untool stats]' : chalk.bold('untool stats'));
    console.info(
      stats.toString({ chunks: false, modules: false, entrypoints: false })
    );
  }
}
