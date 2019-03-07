'use strict';
/* eslint-disable no-console */

const chalk = require('chalk');
const escapeRegExp = require('escape-string-regexp');

const logLevels = { error: 0, warn: 1, info: 2, request: 3 };

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
    return (error.stack || error).replace(
      new RegExp(escapeRegExp(workspace), 'g'),
      '.'
    );
  }
  error(error) {
    const { level, name } = this;
    const prefix = colorize(`${name}:error`, 'red');
    if (level >= logLevels.error) {
      console.error(`${prefix} ${this.renderError(error)}`);
    }
  }
  warn(warning) {
    const { level, name } = this;
    const prefix = colorize(`${name}:warning`, 'yellow');
    if (level >= logLevels.warn) {
      console.warn(`${prefix} ${this.renderError(warning)}`);
    }
  }
  info(message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:info`, 'gray');
    if (level >= logLevels.info) {
      console.log(`${prefix} ${message}`);
    }
  }
  request(message) {
    const { level, name } = this;
    const prefix = colorize(`${name}:request`, 'gray');
    if (level >= logLevels.request) {
      console.log(`${prefix} ${message}`);
    }
  }
};

exports.logLevels = logLevels;
