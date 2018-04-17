const { readFileSync: readFile } = require('fs');
const { join, dirname, isAbsolute } = require('path');

const { sync: findUp } = require('find-up');
const { create: { sync: createResolver } } = require('enhanced-resolve');

const pkgFile = findUp('package.json');
const rootDir = dirname(pkgFile);

const checkESNextPath = modPath =>
  modPath.indexOf(join(dirname(__dirname), 'shims')) === 0 ||
  modPath.indexOf('node_modules') === -1 ||
  /mixin(\.[a-z]+)?\.js$/.test(modPath);

const checkESNextConfig = modPath =>
  /"(e|j)snext(:(browser|server|main|mixin(:[a-z]+)?))?":/m.test(
    readFile(findUp('package.json', { cwd: dirname(modPath) }), 'utf8')
  );

exports.checkESNext = (target, defaults) => {
  const cache = {};
  const resolve = createResolver(exports.getResolveConfig(target, defaults));
  const check = modPath => {
    if (!(modPath in cache)) {
      if (isAbsolute(modPath)) {
        cache[modPath] = checkESNextPath(modPath) || checkESNextConfig(modPath);
      } else {
        cache[modPath] = check(resolve(rootDir, modPath));
      }
    }
    return cache[modPath];
  };
  return check;
};

exports.getResolveConfig = (target, defaults) => ({
  ...defaults,
  extensions: ['.js'],
  mainFields: [
    `esnext:${target}`,
    `jsnext:${target}`,
    `${target}`,
    'esnext',
    'jsnext',
    'esnext:main',
    'jsnext:main',
    'main',
  ],
});
