const { readFileSync } = require('fs');
const { dirname, isAbsolute } = require('path');

const { sync: findUp } = require('find-up');

const checkESNextPath = modPath =>
  modPath.indexOf('.mjs') === modPath.length - 4 ||
  modPath.indexOf('node_modules') === -1 ||
  /mixin(\.[a-z]+)?\.js$/.test(modPath);

const checkESNextConfig = modPath =>
  /"(module|((e|j)snext(:(browser|server|main|mixin(:[a-z]+)?))?))":/m.test(
    readFileSync(findUp('package.json', { cwd: dirname(modPath) }), 'utf8')
  );

const cache = {};

exports.checkESNext = function checkESNext(modPath) {
  if (!(modPath in cache)) {
    if (isAbsolute(modPath)) {
      cache[modPath] = checkESNextPath(modPath) || checkESNextConfig(modPath);
    } else {
      cache[modPath] = checkESNext(require.resolve(modPath));
    }
  }
  return cache[modPath];
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
