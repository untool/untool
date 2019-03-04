'use strict';
/* eslint-disable no-console */

const { basename } = require('path');

const PrettyError = require('pretty-error');

const logLevels = { error: 0, warn: 1, info: 2, request: 3 };

module.exports = exports = class Logger {
  constructor(name, workspace) {
    this.name = name;
    this.level = logLevels.info;
    this.prettyError = new PrettyError();
    this.prettyError.withoutColors();
    this.prettyError.appendStyle({
      'pretty-error > header > title > kind': {
        display: 'none',
      },
      'pretty-error > header > colon': {
        display: 'none',
      },
      'pretty-error > trace > item': {
        marginBottom: 0,
      },
    });
    this.prettyError.alias(workspace, `${basename(workspace)}`);
  }
  setLogLevel(level) {
    this.level = level;
  }
  error(error) {
    const { level, name, prettyError } = this;
    if (level >= logLevels.error) {
      console.error(
        `[${name}:error] ${prettyError.render(error).replace(/^\s+/, '')}`
      );
    }
  }
  warn(warning) {
    const { level, name } = this;
    if (level >= logLevels.warn) {
      console.warn(`[${name}:warning] ${warning}`);
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
