import { getOptions } from 'loader-utils';

export default function() {
  this.cacheable();
  const { target, config } = getOptions(this);
  const plugins = config
    .getPlugins(target)
    .map(plugin => `require('${plugin}').default`);
  if (target === 'server') {
    return `
      var path = require('path');
      var root = require('find-up').sync('package.json');
      var expand = path.join.bind(path, root);
      module.exports = {
        getPlugins() { return [${plugins.join(',')}] },
        getConfig() { return ${JSON.stringify(config).replace(
          new RegExp(`"${config.rootDir}([^"]*)"`, 'g'),
          'expand(".$1")'
        )} },
      };
    `;
  } else {
    return `
      module.exports = {
        getPlugins() { return [${plugins.join(',')}] },
        getConfig() { return ${JSON.stringify(
          Object.keys(config).reduce(
            (result, key) =>
              key.startsWith('_') ? result : { ...result, [key]: config[key] },
            {}
          )
        ).replace(new RegExp(`"${config.rootDir}([^"]*)"`, 'g'), '".$1"')} },
      };
    `;
  }
}
