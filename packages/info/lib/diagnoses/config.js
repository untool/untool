'use strict';

const chalk = require('chalk');

module.exports = class ConfigDiagnosisMixins {
  constructor(config) {
    this.config = config;
    this.diagnoses = [];
  }
  diagnoseConfig() {
    const { _warnings: diagnoses } = this.config;
    this.diagnoses = diagnoses;
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
        'Invalid configuration value(s) detected:\n' + warnings.join('\n')
      );
      logger.hint(
        'Fix invalid configuration value(s):\n' +
          'Please review your project configuration and make sure to fix all ' +
          'issues reported above. Misconfiguration may lead to bugs and ' +
          'might break your application.'
      );
    }
  }
};
