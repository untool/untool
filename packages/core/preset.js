import { dirname } from 'path';

import { sync as findUp } from 'find-up';

const pkgFile = findUp('package.json');
const rootDir = dirname(pkgFile);

const { name, version } = require(pkgFile);

export default {
  namespace: name,
  version: version,
  rootDir: rootDir,
  mixins: ['@untool/yargs'],
  presets: ['@untool/express', '@untool/webpack'],
};
