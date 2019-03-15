'use strict';

const chalk = require('chalk');
const { sync: resolve } = require('enhanced-resolve');

module.exports = class InvalidPackageDiagnosisMixins {
  constructor(config) {
    this.config = config;
    this.diagnoses = [];
  }
  diagnoseInvalidPackages(context, packageName) {
    const { _workspace } = this.config;
    const pkgFile = `${packageName}/package.json`;
    const { version: refVersion } = require(resolve(context, pkgFile));
    const { version: realVersion } = require(resolve(_workspace, pkgFile));
    if (refVersion !== realVersion) {
      this.diagnoses.push(
        `package ${packageName} must be installed in version ${refVersion}`
      );
    }
  }
  getDiagnoses() {
    return [...this.diagnoses];
  }
  logDiagnoses(logger) {
    const { diagnoses } = this;
    if (diagnoses.length) {
      const warnings = diagnoses.map(
        (diagnosis) => `${chalk.yellow('-')} ${diagnosis}`
      );
      logger.warn(
        'Invalid package version(s) detected:\n' + warnings.join('\n')
      );
      logger.hint(
        'Fix invalid package version(s):\n' +
          'Please use your package manager of choice (npm or yarn) to ' +
          'install the package versions mentioned above directly into you ' +
          'project. Failing to do so will almost certainly lead to hard ' +
          'to debug issues with your application.'
      );
    }
  }
};
