const { dirname } = require('path');

const { sync: findUp } = require('find-up');

const pkgFile = findUp('package.json');
const rootDir = dirname(pkgFile);

const { name, version } = require(pkgFile);

module.exports = {
  namespace: name,
  version: version,
  rootDir: rootDir,
  mixins: ['@untool/yargs', '@untool/react'],
  presets: ['@untool/express', '@untool/webpack'],
};
