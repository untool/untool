'use strict';

const { readFileSync: readFile } = require('fs');
const { join, dirname } = require('path');

const { sync: findUp } = require('find-up');

const isLocal = (path) => !path.includes('node_modules');
const isShim = (path) => path.startsWith(join(dirname(__dirname), 'shims'));
const isMixin = (path) => /mixin(\.[a-z]+)?\.js$/.test(path);
const isModule = (path) =>
  /"((e|j)snext(:[a-z]+)?|module|mixin(:[a-z]+)?)": ?"/m.test(
    readFile(findUp('package.json', { cwd: dirname(path) }), 'utf8')
  );
const cache = {};

exports.isESNext = () => {
  return (path) => {
    if (!(path in cache)) {
      cache[path] = [isLocal, isShim, isMixin, isModule].some((fn) => fn(path));
    }
    return cache[path];
  };
};
