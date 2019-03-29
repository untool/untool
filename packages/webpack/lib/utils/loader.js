'use strict';

const escapeJS = require('jsesc');
const escapeRegExp = require('escape-string-regexp');

const { getOptions } = require('loader-utils');

const getHelpers = (type) =>
  type === 'server'
    ? `
const { dirname, join } = require('path');
const { sync: findUp } = require('find-up');
const rootDir = dirname(findUp('package.json'));
const expand = join.bind(null, rootDir);`
    : '';

const getConfig = (type, { _config: config }) =>
  escapeJS(config).replace(
    new RegExp(`'${escapeRegExp(config.rootDir)}(.*?)'`, 'g'),
    type === 'server' ? "expand('.$1')" : "'.$1'"
  );

const getMixins = (type, { _mixins: mixins }) => {
  const requires = (mixins[type] || []).map(
    (mixin) => `((m) => m.default || m )(require('${escapeJS(mixin)}'))`
  );
  return `[${requires.join(',')}]`;
};

module.exports = function configLoader() {
  this.cacheable();
  const { type, config } = getOptions(this);
  return `
${getHelpers(type)}
const configs = {};
exports.getConfig = (overrides = {}) => {
  const key = Object.keys(overrides).length ? JSON.stringify(overrides) : '_';
  if (!configs[key]) {
    const { internal: utils } = require('@untool/core');
    const { environmentalize, placeholdify, merge } = utils;
    const raw = merge(${getConfig(type, config)}, overrides);
    configs[key] = environmentalize(placeholdify(raw));
  }
  return configs[key];
};
exports.getMixins = () => ${getMixins(type, config)};
`.trim();
};

module.exports.path = __filename;
