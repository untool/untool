'use strict';

const chalk = require('chalk');
const { sync: resolve } = require('enhanced-resolve');

const detectDuplicates = require('duplitect');

module.exports = class Doctor {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.results = {
      config: [],
      duplicatePackages: [],
      invalidPackages: [],
    };
  }
  validateConfig() {
    return (this.results.config = this.config._warnings);
  }
  detectDuplicatePackages(...packages) {
    const { _workspace } = this.config;
    const duplicates = detectDuplicates(_workspace, ...packages);
    return (this.results.duplicatePackages = [
      ...this.results.duplicatePackages,
      ...duplicates.map(
        (duplicate) =>
          `package ${duplicate} may not be installed more than once`
      ),
    ]);
  }
  detectInvalidPackageVersion(context, packageName) {
    const { _workspace } = this.config;
    const { version: refVersion } = require(resolve(
      context,
      `${packageName}/package.json`
    ));
    const { version: realVersion } = require(resolve(
      _workspace,
      `${packageName}/package.json`
    ));
    if (refVersion !== realVersion) {
      this.results.invalidPackages.push(
        `package ${packageName} must be installed in version ${refVersion}`
      );
    }
  }
  logResults() {
    const { config, duplicatePackages, invalidPackages } = this.results;
    logConfigWarnings(config, this.logger);
    logDuplicatePackageWarnings(duplicatePackages, this.logger);
    logInvalidPackageWarnings(invalidPackages, this.logger);
  }
};

const logConfigWarnings = (warnings, logger) => {
  if (warnings.length) {
    logger.warn(
      ['invalid configuration value(s) detected', ...warnings].join(
        `\n${chalk.yellow('- ')}`
      )
    );
    logger.hint(
      'please review your project configuration and make sure to fix all ' +
        'issues reported above. misconfiguration may lead to bugs and might ' +
        'break your application.'
    );
  }
};

const logDuplicatePackageWarnings = (warnings, logger) => {
  if (warnings.length) {
    logger.warn(
      ['duplicate package(s) found', ...warnings].join(
        `\n${chalk.yellow('- ')}`
      )
    );
    logger.hint(
      'please use your package manager of choice (npm or yarn) to identify ' +
        'and remove duplicate/redundant versions of the packages mentioned ' +
        'above. failing to do so will almost certainly lead to hard-to-debug ' +
        'issues with your application.'
    );
  }
};

const logInvalidPackageWarnings = (warnings, logger) => {
  if (warnings.length) {
    logger.warn(
      ['invalid package version(s) found', ...warnings].join(
        `\n${chalk.yellow('- ')}`
      )
    );
    logger.hint(
      'please use your package manager of choice (npm or yarn) to install ' +
        'the package versions mentioned above directly into you project. ' +
        'failing to do so will almost certainly lead to hard-to-debug issues ' +
        'with your application.'
    );
  }
};
