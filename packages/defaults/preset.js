import { readFileSync } from 'fs';
import { dirname } from 'path';

import { sync as findUp } from 'find-up';

const pkgFile = findUp('package.json');
const pkgData = JSON.parse(readFileSync(pkgFile));

const rootDir = dirname(pkgFile);
const moduleDir = dirname(dirname(require.resolve('mixinable')));

export default {
  namespace: pkgData.name,
  version: pkgData.version,
  rootDir: rootDir,
  moduleDir: moduleDir,
  plugins: ['@untool/yargs'],
  presets: ['@untool/express', '@untool/webpack'],
};
