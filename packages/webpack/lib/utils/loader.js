const { getOptions } = require('loader-utils');

module.exports = function() {
  this.cacheable();
  const { target, config } = getOptions(this);
  const mixins = config.mixins[target].map(mixin => `require('${mixin}')`);
  if (target === 'server') {
    return `
      var path = require('path');
      var root = require('find-up').sync('package.json');
      var expand = path.join.bind(path, root);
      exports.getConfig = function () { return ${JSON.stringify(config)
        .replace(new RegExp(`"${config.rootDir}([^"]*)"`, 'g'), 'expand(".$1")')
        .replace(/"mixins":{.*?}/, `"mixins":[${mixins.join(', ')}]`)} };
    `;
  } else {
    return `
      exports.getConfig = function () { return ${JSON.stringify(
        Object.keys(config).reduce(
          (result, key) =>
            key.startsWith('_') ? result : { ...result, [key]: config[key] },
          {}
        )
      )
        .replace(new RegExp(`"${config.rootDir}([^"]*)"`, 'g'), '".$1"')
        .replace(/"mixins":{.*?}/, `"mixins":[${mixins.join(', ')}]`)} };
    `;
  }
};
