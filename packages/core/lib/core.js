import define from 'mixinable';
import autoBind from 'auto-bind';

import { config } from './config';

export class Plugin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
    this.mode = 'build';
    autoBind(this);
  }
}

export function bootstrap(...args) {
  const mixins = config.getPlugins('core').map(mixin => require(mixin).default);
  const hooks = {
    ...mixins.reduce((result, mixin) => ({ ...result, ...mixin.hooks }), {}),
  };
  const createMixinable = define(hooks)(...mixins);
  const core = {};
  const mixinable = createMixinable(core, config, ...args);
  Object.keys(hooks).forEach(key =>
    Object.defineProperty(core, key, {
      enumerable: true,
      configurable: true,
      get: () => mixinable[key].bind(mixinable),
    })
  );
  return core;
}
