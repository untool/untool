'use strict';

const chalk = require('chalk');
const { sync: resolve } = require('enhanced-resolve');

exports.getHoistedVersionWarning = (workspace, context, packageName) => {
  const pkgFile = `${packageName}/package.json`;
  const { version: refVersion } = require(resolve(context, pkgFile));
  const { version: realVersion } = require(resolve(workspace, pkgFile));
  if (refVersion !== realVersion) {
    return `package ${packageName} must be installed in version ${refVersion}`;
  }
};

exports.versionMismatchReporter = (warnings, { warn, hint }) => {
  if (warnings.length) {
    warn(
      'Invalid package version(s) detected:\n' +
        warnings.map((message) => `${chalk.yellow('-')} ${message}`).join('\n')
    );
    hint(
      'Fix invalid package version(s):\n' +
        'Please use your package manager of choice (npm or yarn) to ' +
        'install the package versions mentioned above directly into your ' +
        'project. Not doing so will almost certainly lead to hard to ' +
        'debug issues with your application.'
    );
  }
};
