const { readFileSync } = require('fs');
const { join, dirname, isAbsolute } = require('path');

const { sync: findUp } = require('find-up');
const { create: { sync: createResolver } } = require('enhanced-resolve');

const pkgFile = findUp('package.json');
const rootDir = dirname(pkgFile);

const checkESNextPath = modPath =>
  modPath.indexOf(join(dirname(__dirname), 'shims')) === 0 ||
  modPath.indexOf('.mjs') === modPath.length - 4 ||
  modPath.indexOf('node_modules') === -1 ||
  /mixin(\.[a-z]+)?\.js$/.test(modPath);

const checkESNextConfig = modPath =>
  /"(module|((e|j)snext(:(browser|server|main|mixin(:[a-z]+)?))?))":/m.test(
    readFileSync(findUp('package.json', { cwd: dirname(modPath) }), 'utf8')
  );

exports.checkESNext = function checkESNext(target, defaults) {
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

exports.getResolveConfig = function getResolveConfig(target, defaults) {
  return {
    ...defaults,
    extensions: ['.mjs', '.js'],
    mainFields: [
      `esnext:${target}`,
      `jsnext:${target}`,
      `${target}`,
      'esnext',
      'jsnext',
      'esnext:main',
      'jsnext:main',
      'module',
      'main',
    ],
  };
};
