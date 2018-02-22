import { getOptions } from 'loader-utils';

import config from '../config';

import { plugin as resolve } from './resolve';

export default function() {
  this.cacheable();
  const { target } = getOptions(this) || { target: 'browser' };
  const plugins = config.plugins
    .map(plugin => resolve(target, config.rootDir, plugin))
    .filter(plugin => !!plugin)
    .map(
      plugin => `require('${resolve(target, config.rootDir, plugin)}').default`
    )
    .join(',');
  let filteredConfig = JSON.stringify(config);
  if (target === 'browser') {
    filteredConfig.replace(config.rootDir, '.');
  }
  return `
    module.exports={
      getConfig() { return ${filteredConfig} },
      getPlugins() { return [${plugins}] }
    };
  `;
}
