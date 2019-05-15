'use strict';

const { EOL } = require('os');

const prettyMS = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const chalk = require('chalk');

const { BuildError } = require('../utils/errors');

const formatAssets = (assets) =>
  assets
    .filter(({ name }) => !name.endsWith('.map'))
    .map(({ name, size, isOverSizeLimit }) => {
      const prettySize = isOverSizeLimit
        ? chalk.enabled
          ? chalk.red(prettyBytes(size))
          : `${prettyBytes(size)} !!!`
        : prettyBytes(size);
      return `${chalk.gray('-')} ${name} (${prettySize})`;
    })
    .join(EOL);

const formatError = (name, duration, isRebuild) => {
  const message = `bundling '${name}' failed after ${duration}`;
  return isRebuild ? `re-${message}` : message;
};

const formatWarning = (name, duration, assets, isRebuild) => {
  const message = `bundling '${name}' finished with warnings after ${duration}`;
  return isRebuild ? `re-${message}` : `${message}\n${formatAssets(assets)}`;
};

const formatSuccess = (name, duration, assets, isRebuild) => {
  const message = `bundling '${name}' finished after ${duration}`;
  return isRebuild ? `re-${message}` : `${message}\n${formatAssets(assets)}`;
};

exports.LoggerPlugin = class LoggerPlugin {
  constructor(logger) {
    this.logger = logger;
    this.lastHashes = {};
  }
  apply(compiler) {
    compiler.hooks.done.tap('UntoolLoggerPlugin', (stats) => {
      const { name } = stats.compilation;
      if (this.lastHashes[name] === stats.hash) {
        return;
      }
      const { hash, startTime, endTime } = stats;
      const isRebuild = this.lastHashes[name];
      const duration = prettyMS(endTime - startTime);

      const hasWarnings = stats.hasWarnings();
      const hasErrors = stats.hasErrors();

      const { assets, errors, warnings, children } = stats.toJson({
        all: false,
        assets: true,
        performance: true,
        errors: true,
        warnings: true,
        children: true,
      });

      if (hasErrors) {
        this.logger.info(formatError(name, duration, isRebuild));
      } else {
        if (hasWarnings) {
          this.logger.info(formatWarning(name, duration, assets, isRebuild));
        } else {
          this.logger.info(formatSuccess(name, duration, assets, isRebuild));
        }
      }
      if (hasErrors || hasWarnings) {
        errors
          .concat(...children.map((c) => c.errors))
          .forEach((error) => this.logger.error(new BuildError(error)));
        warnings
          .concat(...children.map((c) => c.warnings))
          .forEach((warning) => this.logger.warn(warning));
      }
      this.lastHashes[name] = hash;
    });
  }
};
