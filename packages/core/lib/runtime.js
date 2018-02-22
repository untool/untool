import autoBind from 'auto-bind';
import define, { override } from 'mixinable';

import { getConfig, getPlugins } from '@@CONFIG@@';

export { default as Plugin } from './plugins/runtime';

export const render = (...args) => {
  const config = getConfig();
  const mixins = getPlugins();

  const definition = {
    ...mixins.reduce((result, mixin) => ({ ...result, ...mixin.definition })),
    render: override,
    logInfo: override,
    logWarn: override,
    logError: override,
  };

  const mixin = define(definition);
  const create = mixin(...mixins);

  return (req, res, next) => {
    const core = {};
    const mixinable = autoBind(create(core, config, ...args));
    Object.keys(definition).forEach(key =>
      Object.defineProperty(core, key, {
        enumerable: true,
        configurable: true,
        get: () => mixinable[key],
      })
    );
    autoBind(core);
    mixinable.render(req, res, next);
  };
};
