const { getOptions } = require('loader-utils');

const getMixins = (target, config) =>
  config.mixins[target].map(mixin => `require('${mixin}')`);

const getConfig = (target, config) =>
  JSON.stringify(config)
    .replace(
      new RegExp(`"${config.rootDir}(.*?)"`, 'g'),
      target === 'server' ? 'expand(".$1")' : '".$1"'
    )
    .replace(
      /"mixins":{.*?}/,
      `"mixins":[${getMixins(target, config).join(', ')}]`
    );

const getModule = (target, config) =>
  (target === 'server'
    ? [
        'var path = require("path");',
        'var root = path.dirname(require("find-up").sync("package.json"));',
        'var expand = path.join.bind(path, root);',
      ]
    : []
  )
    .concat(
      `exports.getConfig = function () { return ${getConfig(target, config)} };`
    )
    .join('\n');

module.exports = function() {
  this.cacheable();
  const { target, config } = getOptions(this);
  return getModule(target, config);
};
