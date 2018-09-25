'use strict';

const { getOptions } = require('loader-utils');

const getMixins = (type, config) =>
  `[${(config.mixins[type] || [])
    .map(
      (mixin) => `(function(m) { return m.default || m })(require('${mixin}'))`
    )
    .join(',')}]`;

const getConfig = (type, config) =>
  JSON.stringify(
    Object.assign({}, config._config, { mixins: undefined })
  ).replace(
    new RegExp(`"${config.rootDir}(.*?)"`, 'g'),
    type === 'server' ? 'expand(".$1")' : '".$1"'
  );

const getConfigAndMixins = (...args) =>
  `{ config: ${getConfig(...args)}, mixins: ${getMixins(...args)} }`;

const getModule = (type, config) => {
  const configAndMixins = getConfigAndMixins(type, config);
  return (type === 'server'
    ? [
        'var path = require("path");',
        'var root = path.dirname(require("find-up").sync("package.json"));',
        'var expand = path.join.bind(path, root);',
      ]
    : []
  )
    .concat(
      `exports.getConfigAndMixins = function () { return ${configAndMixins} };`
    )
    .join('\n');
};

module.exports = function() {
  this.cacheable();
  const { type, config } = getOptions(this);
  return getModule(type, config);
};
