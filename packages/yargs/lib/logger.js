'use strict';
/* eslint-disable no-console */

const escapeRegExp = require('escape-string-regexp');

const logLevels = { error: 0, warn: 1, info: 2, request: 3 };

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
    if (level >= logLevels.error) {
      console.error(`[${name}:error] ${this.renderError(error)}`);
    }
  }
  warn(warning) {
    const { level, name } = this;
    if (level >= logLevels.warn) {
      console.warn(`[${name}:warning] ${this.renderError(warning)}`);
    }
  }
  info(message) {
    const { level, name } = this;
    if (level >= logLevels.info) {
      console.log(`[${name}:info] ${message}`);
    }
  }
  request(message) {
    const { level, name } = this;
    if (level >= logLevels.request) {
      console.log(`[${name}:request] ${message}`);
    }
  }
};

exports.logLevels = logLevels;
