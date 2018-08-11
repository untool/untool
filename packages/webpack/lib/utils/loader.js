'use strict';

const { getOptions } = require('loader-utils');

const getMixins = (target, config) =>
  `[${(config.mixins[target] || [])
    .map(
      (mixin) => `(function(m) { return m.default || m })(require('${mixin}'))`
    )
    .join(',')}]`;

const getConfig = (target, config) =>
  JSON.stringify(
    Object.assign({}, config._config, { mixins: undefined })
  ).replace(
    new RegExp(`"${config.rootDir}(.*?)"`, 'g'),
    target === 'server' ? 'expand(".$1")' : '".$1"'
  );

const getConfigAndMixins = (...args) =>
  `{ config: ${getConfig(...args)}, mixins: ${getMixins(...args)} }`;

const getModule = (target, config) => {
  const configAndMixins = getConfigAndMixins(target, config);
  return (target === 'server'
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
  const { target, config } = getOptions(this);
  return getModule(target, config);
};
