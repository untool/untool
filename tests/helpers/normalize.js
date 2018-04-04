const { dirname, join } = require('path');
const { readdirSync, statSync } = require('fs');

const isPlainObject = require('is-plain-object');

const flatten = require('flat');
const { unflatten } = flatten;

const normalizePath = string =>
  string
    .replace(new RegExp(dirname(dirname(__dirname)), 'g'), '.')
    .replace(
      /-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
      ''
    );

exports.normalizeConfig = config =>
  JSON.parse(normalizePath(JSON.stringify(config)));

exports.normalizeMixin = mixin =>
  Object.assign(Object.create(mixin.constructor.prototype), mixin, {
    config: exports.normalizeConfig(mixin.config),
  });

exports.normalizeWebpackConfig = config => {
  const flatConfig = flatten(config);
  return unflatten(
    Object.keys(flatConfig).reduce(
      (result, key) => ({
        ...result,
        [normalizePath(key)]: key.endsWith('.id')
          ? 0
          : typeof flatConfig[key] === 'string'
            ? normalizePath(flatConfig[key])
            : flatConfig[key],
      }),
      {}
    )
  );
};

exports.normalizeResponse = res => {
  return JSON.parse(
    JSON.stringify(res).replace(/(-[a-f0-9]{12}|blob:http:[a-z0-9/:-]+)/g, '')
  );
};

exports.normalizeArtefacts = dir =>
  readdirSync(dir).reduce((result, file) => {
    const path = join(dir, file);
    const name = file.replace(/-[a-f0-9]{12}/, '');
    const stats = statSync(path);
    if (stats.isDirectory()) {
      return { ...result, [name]: exports.normalizeArtefacts(path) };
    }
    return { ...result, [name]: stats.size > 0 };
  }, {});

exports.normalizeArgTypes = obj => {
  if (typeof obj === 'function') {
    return `${typeof obj}:${obj.length}`;
  } else if (['boolean', 'number', 'string'].includes(typeof obj)) {
    return typeof obj;
  } else if ([undefined, null].includes(obj)) {
    return `${obj}`;
  } else if (Array.isArray(obj)) {
    return obj.map(_obj => exports.normalizeArgTypes(_obj));
  } else if (isPlainObject(obj)) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key]: exports.normalizeArgTypes(obj[key]),
      }),
      {}
    );
  } else {
    return (obj.constructor && obj.constructor.name) || typeof obj;
  }
};
