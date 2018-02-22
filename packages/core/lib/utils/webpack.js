import { readFileSync } from 'fs';
import { dirname, isAbsolute } from 'path';

import { sync as findUp } from 'find-up';

import config from '../config';

const checkESNextPath = modPath =>
  modPath.indexOf('.mjs') === modPath.length - 4 ||
  modPath.indexOf('node_modules') === -1 ||
  /plugin(\.[a-z]+)?\.js$/.test(modPath);

const checkESNextConfig = modPath =>
  /"(module|((e|j)snext(:(browser|server|main|plugin(:[a-z]+)?))?))":/m.test(
    readFileSync(findUp('package.json', { cwd: dirname(modPath) }), 'utf8')
  );

const cache = {};

export const checkESNext = modPath => {
  if (!(modPath in cache)) {
    if (isAbsolute(modPath)) {
      cache[modPath] = checkESNextPath(modPath) || checkESNextConfig(modPath);
    } else {
      cache[modPath] = checkESNext(require.resolve(modPath));
    }
  }
  return cache[modPath];
};

export const getAssetPath = path =>
  `${config.assetPath}/${path}`.replace(/^\/+/, '');

export { webpack as resolve } from './resolve';
