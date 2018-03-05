import define, { override } from 'mixinable';
import autoBind from 'auto-bind';

export class Mixin {
  constructor(core, config) {
    this.core = core;
    this.config = config;
    this.options = {};
    if (typeof window === 'undefined') {
      this.mode = 'server';
    } else {
      this.mode = 'browser';
    }
    autoBind(this);
  }
}

export function render(...renderArgs) {
  return (config, mixins) => {
    const strategies = {
      ...mixins.reduce(
        (result, mixin) => ({ ...result, ...mixin.strategies }),
        {}
      ),
      render: override,
    };
    const createMixinable = define(strategies)(...mixins);
    return (...callArgs) => {
      const core = {};
      const mixinable = createMixinable(core, config, ...renderArgs);
      Object.keys(strategies).forEach(key =>
        Object.defineProperty(core, key, {
          enumerable: true,
          configurable: true,
          get: () => mixinable[key].bind(mixinable),
        })
      );
      core.render(...callArgs);
    };
  };
}
