import autoBind from 'auto-bind';
import define, { parallel, pipe, override } from 'mixinable';

import config from './config';
import { plugin as resolve } from './utils/resolve';

const mixins = config.plugins
  .map(plugin => resolve('core', config.rootDir, plugin))
  .filter(plugin => !!plugin)
  .map(plugin => require(plugin).default);

const definition = {
  configureWebpack: pipe,
  enhanceWebpack: parallel,
  initializeServer: parallel,
  finalizeServer: parallel,
  registerCommands: pipe,
  logInfo: override,
  logWarn: override,
  logError: override,
  logStats: override,
};

const mixin = define(definition);
const create = mixin(...mixins);

const core = {};
const mixinable = autoBind(create(core, config, require('..')));
Object.keys(definition).forEach(key =>
  Object.defineProperty(core, key, {
    enumerable: true,
    configurable: true,
    get: () => mixinable[key],
  })
);

export default autoBind(core);
