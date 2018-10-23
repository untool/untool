'use strict';

const { getOptions } = require('loader-utils');

const getConfig = (type, { _config: config }) =>
  JSON.stringify(config).replace(
    new RegExp(`"${config.rootDir}(.*?)"`, 'g'),
    type === 'server' ? 'expand(".$1")' : '".$1"'
  );

const getMixins = (type, { _mixins: mixins }) => {
  const requires = Array.from(mixins[type] || []).map(
    (mixin) => `((m) => m.default || m )(require('${mixin}'))`
  );
  return `[${requires.join(',')}]`;
};

module.exports = function configLoader() {
  this.cacheable();
  const { type, config } = getOptions(this);
  return [
    'const utils = require("@untool/core/lib/utils");',
    ...(type === 'server'
      ? [
          'const { dirname, join } = require("path");',
          'const { sync: findUp } = require("find-up");',
          'const root = dirname(findUp("package.json"));',
          'const expand = (path) => join(root, path);',
        ]
      : []),
    'const { environmentalize, placeholdify, merge } = utils;',
    `const override = (...args) => merge(${getConfig(type, config)}, ...args);`,
    'const functions = [override, placeholdify, environmentalize];',
    'const getConfig = [].reduce.bind(functions, (res, fn) => fn(res));',
    'exports.getConfig = (overrides = {}) => getConfig(overrides);',
    `exports.getMixins = () => ${getMixins(type, config)};`,
  ].join('\n');
};
