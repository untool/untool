'use strict';

const mergeWith = require('lodash.mergewith');
const flatten = require('flat');
const isPlainObject = require('is-plain-object');
const escapeRegExp = require('escape-string-regexp');

exports.merge = (...args) =>
  mergeWith({}, ...args, (objValue, srcValue, key) => {
    if (Array.isArray(objValue)) {
      if ('mixins' === key) {
        return objValue.concat(srcValue);
      }
      return srcValue;
    }
  });

exports.placeholdify = (config) => {
  const flatConfig = flatten(config);
  const flatKeys = Object.keys(flatConfig);
  const regExp = new RegExp(`<(${flatKeys.map(escapeRegExp).join('|')})>`, 'g');
  const replaceRecursive = (item) => {
    if (Array.isArray(item)) {
      return item.map(replaceRecursive);
    }
    if (isPlainObject(item)) {
      return Object.keys(item).reduce((result, key) => {
        result[key] = replaceRecursive(item[key]);
        return result;
      }, {});
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
      return Object.keys(item).reduce((result, key) => {
        result[key] = replaceRecursive(item[key]);
        return result;
      }, {});
    }
    if (regExp.test(item)) {
      return item.replace(regExp, (_, key) =>
        replaceRecursive((_env[key] = env[key] || ''))
      );
    }
    return item;
  };
  return Object.assign(replaceRecursive(_config), { _config, _env });
};
