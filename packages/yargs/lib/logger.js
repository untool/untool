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

const logLevels = { error: 0, warn: 1, info: 2, verbose: 3 };

const colorize = (string, color) => {
  return chalk.enabled ? chalk[color](string) : `[${string}]`;
};

module.exports = exports = class Logger {
  constructor(name, workspace) {
    this.name = name;
    this.workspace = workspace;
    this.level = logLevels.info;
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
  hint(message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:hint`, 'gray');
    if (level >= logLevels.verbose) {
      console.log(wrap(`${prefix} ${message}`));
    }
  }
  request(message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:request`, 'gray');
    if (level >= logLevels.verbose) {
      console.log(wrap(`${prefix} ${message}`));
    }
  }
};

exports.logLevels = logLevels;
