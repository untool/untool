'use strict';

const chalk = require('chalk');
const detectDuplicates = require('duplitect');

module.exports = class DuplicatePackagesDiagnosisMixins {
  constructor(config) {
    this.config = config;
    this.diagnoses = [];
  }
  diagnoseDuplicatePackages(...packages) {
    const { _workspace } = this.config;
    const duplicates = detectDuplicates(_workspace, ...packages);
    const diagnoses = duplicates.map(
      (duplicate) => `package ${duplicate} may not be installed more than once`
    );
    this.diagnoses = [...this.diagnoses, ...diagnoses];
  }
  logDiagnoses(logger) {
    const { diagnoses } = this;
    if (diagnoses.length) {
      const warnings = diagnoses.map(
        (diagnosis) => `${chalk.yellow('-')} ${diagnosis}`
      );
      logger.warn(
        'Problematic duplicate package(s) detected:\n' + warnings.join('\n')
      );
      logger.hint(
        'Fix duplicate package(s):\n' +
          'Please use your package manager of choice (npm or yarn) to ' +
          'identify and remove duplicate/redundant versions of the packages ' +
          'mentioned above. Failing to do so will almost certainly lead to ' +
          'hard to debug issues with your application.'
      );
    }
  }
};
