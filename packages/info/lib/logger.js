'use strict';
/* eslint-disable no-console */

const chalk = require('chalk');
const escapeRegExp = require('escape-string-regexp');

const colorize = (string, color) => {
  return chalk.enabled ? chalk[color](string) : `[${string}]`;
};

const logLevels = { error: 0, warn: 1, info: 2, verbose: 3 };

class Logger {
  constructor({ name, _workspace }) {
    this.name = name;
    this.workspace = _workspace;
    this.level = logLevels.info;
  }
  setLogLevel(level) {
    this.level = level;
  }
  error(error) {
    const { level, name, workspace } = this;
    const prefix = colorize(`${name}:error`, 'red');
    const message = String(error.stack || error).replace(
      new RegExp(escapeRegExp(workspace), 'g'),
      '.'
    );
    if (level >= logLevels.error) {
      console.error(`${prefix} ${message}`);
    }
  }
  warn(warning) {
    const { level, name } = this;
    const prefix = colorize(`${name}:warning`, 'yellow');
    const message = String(warning.stack || warning);
    if (level >= logLevels.warn) {
      console.warn(`${prefix} ${message}`);
    }
  }
  info(message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:info`, 'gray');
    if (level >= logLevels.info) {
      console.log(`${prefix} ${message}`);
    }
  }
  _(type, message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:${type}`, 'gray');
    if (level >= logLevels.verbose) {
      console.log(`${prefix} ${message}`);
    }
  }
}

exports.createLogger = (...args) =>
  new Proxy(new Logger(...args), {
    get(logger, prop) {
      return prop in logger
        ? typeof logger[prop] === 'function'
          ? logger[prop].bind(logger)
          : logger[prop]
        : logger._.bind(logger, prop);
    },
  });

exports.logLevels = logLevels;
