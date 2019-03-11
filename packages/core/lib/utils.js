'use strict';

const mergeWith = require('lodash.mergewith');
const flatten = require('flat');
const isPlainObject = require('is-plain-object');
const escapeRegExp = require('escape-string-regexp');

exports.invariant = (condition, message) => {
  if (condition) return;
  throw new Error(`Invariant violation: ${message}`);
};

exports.validate = (strategy, checkArgs = () => {}, checkResult = () => {}) =>
  Object.defineProperty(
    (functions, ...initialArgs) =>
      strategy(
        functions.map((fn) => (...callArgs) => {
          checkArgs(callArgs, initialArgs);
          const result = fn(...callArgs);
          if (result && typeof result.then === 'function') {
            return result.then((result) => {
              checkResult(result, true, callArgs, initialArgs);
              return result;
            });
          } else {
            checkResult(result, false, callArgs, initialArgs);
            return result;
          }
        }),
        ...initialArgs
      ),
    'name',
    { value: strategy.name }
  );

exports.merge = (...args) =>
  mergeWith({}, ...args, (objValue, srcValue, key) => {
    if (Array.isArray(objValue)) {
      if ('mixins' === key) {
        return [...objValue, ...srcValue];
      }
      if ('presets' === key) {
        return [...srcValue, ...objValue];
      }
      return srcValue;
    }
  });

exports.placeholdify = (config) => {
  const flatConfig = flatten(config);
  const configPaths = Object.keys(flatConfig).map(escapeRegExp);
  const regExp = new RegExp(`<(${configPaths.join('|')})>`, 'g');
  const replaceRecursive = (item) => {
    if (Array.isArray(item)) {
      return item.map(replaceRecursive);
    }
    if (isPlainObject(item)) {
      return Object.entries(item).reduce(
        (result, [key, value]) => ({
          ...result,
          [key]: replaceRecursive(value),
        }),
        {}
      );
    }
    if (regExp.test(item)) {
      return item.replace(regExp, (_, key) =>
        replaceRecursive(flatConfig[key] || '')
      );
    }
    return item;
  };
  return replaceRecursive(config);
};

exports.environmentalize = (_config) => {
  const _env = {};
  const env = global._env || process.env;
  const regExp = /\[(\w+?)\]/g;
  const replaceRecursive = (item) => {
    if (Array.isArray(item)) {
      return item.map(replaceRecursive);
    }
    if (isPlainObject(item)) {
      return Object.entries(item).reduce(
        (result, [key, value]) => ({
          ...result,
          [key]: replaceRecursive(value),
        }),
        {}
      );
    }
    if (regExp.test(item)) {
      return item.replace(regExp, (_, key) =>
        replaceRecursive((_env[key] = env[key] || ''))
      );
    }
    return item;
  };
  return { ...replaceRecursive(_config), _config, _env };
};
