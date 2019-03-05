'use strict';

const prettyMS = require('pretty-ms');

const {
  internal: { BuildError, BuildWarning },
} = require('@untool/webpack');

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
      this.lastHashes[name] = stats.hash;
      const hasWarnings = stats.hasWarnings();
      const hasErrors = stats.hasErrors();
      const duration = prettyMS(stats.endTime - stats.startTime);
      if (hasErrors) {
        this.logger.error(`build target '${name}' failed after ${duration}`);
      } else {
        if (hasWarnings) {
          this.logger.warn(
            `build target '${name}' finished with warnings after ${duration}`
          );
        } else {
          this.logger.info(
            `build target '${name}' succeeded after ${duration}`
          );
        }
      }
      if (hasErrors || hasWarnings) {
        const { errors, warnings, children } = stats.toJson();
        errors
          .concat(...children.map((c) => c.errors))
          .forEach((error) => this.logger.error(new BuildError(error)));
        warnings
          .concat(...children.map((c) => c.warnings))
          .forEach((warning) => this.logger.warn(new BuildWarning(warning)));
      }
    });
  }
};
