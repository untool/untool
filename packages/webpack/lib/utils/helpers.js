const { readFileSync: readFile } = require('fs');
const { join, dirname } = require('path');

const { sync: findUp } = require('find-up');
const { sync: resolve } = require('enhanced-resolve');
const isBuiltin = require('is-builtin-module');

const isLocal = (path) => !path.includes('node_modules');
const isShim = (path) => path.startsWith(join(dirname(__dirname), 'shims'));
const isMixin = (path) => /mixin(\.[a-z]+)?\.js$/.test(path);
const isModule = (path) =>
  /"((e|j)snext(:[a-z]+)?|module(-[a-z]+)?|mixin(:[a-z]+)?)": ?"/m.test(
    readFile(findUp('package.json', { cwd: dirname(path) }), 'utf8')
  );
const isExpression = (path) => /[!?]/.test(path);
const isRelative = (path) => path.startsWith('.');
const isFixture = (path) => /\/fixtures\/[a-z]+-[a-f0-9-]{36}/.test(path);
const isAsset = (path) => !/.js(on)?$/.test(path);

const cache = {};

exports.isESNext = () => {
  return (path) => {
    if (!(path in cache)) {
      cache[path] = [isLocal, isShim, isMixin, isModule].some((fn) => fn(path));
    }
    return cache[path];
  };
};

exports.isExternal = () => {
  const isESNext = exports.isESNext();
  const shouldBeBundled = (context, request) => {
    if (isExpression(request) || isRelative(request)) return true;
    if (isBuiltin(request) || isFixture(request)) return false;
    try {
      const resolved = resolve(context, request);
      return isAsset(resolved) || isESNext(resolved);
    } catch (_) {
      return true;
    }
  };
  return (context, request, callback) => {
    if (shouldBeBundled(context, request)) {
      callback();
    } else {
      callback(null, 'commonjs ' + request);
    }
  };
};
