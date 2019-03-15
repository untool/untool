'use strict';
/* eslint-disable no-console */

const { EOL } = require('os');

const chalk = require('chalk');
const wordWrap = require('word-wrap');
const escapeRegExp = require('escape-string-regexp');

const wrap = (string) =>
  wordWrap(string, {
    indent: '',
    newline: EOL,
    width: process.stdout.columns,
  });

const colorize = (string, color) => {
  return chalk.enabled ? chalk[color](string) : `[${string}]`;
};

const logLevels = { error: 0, warn: 1, info: 2, verbose: 3 };

class Logger {
  constructor({ name, _workspace }) {
    this.name = name;
    this.workspace = _workspace;
    this.level = logLevels.info;
    this.levels = logLevels;
  }
  setLogLevel(level) {
    this.level = level;
  }
  renderError(error) {
    const { workspace } = this;
    return String(error.stack || error).replace(
      new RegExp(escapeRegExp(workspace), 'g'),
      '.'
    );
  }
  error(error) {
    const { level, name } = this;
    const prefix = colorize(`${name}:error`, 'red');
    if (level >= logLevels.error) {
      console.error(wrap(`${prefix} ${this.renderError(error)}`));
    }
  }
  warn(warning) {
    const { level, name } = this;
    const prefix = colorize(`${name}:warning`, 'yellow');
    if (level >= logLevels.warn) {
      console.warn(wrap(`${prefix} ${this.renderError(warning)}`));
    }
  }
  info(message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:info`, 'gray');
    if (level >= logLevels.info) {
      console.log(wrap(`${prefix} ${message}`));
    }
  }
  _(type, message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:${type}`, 'gray');
    if (level >= logLevels.verbose) {
      console.log(wrap(`${prefix} ${message}`));
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
