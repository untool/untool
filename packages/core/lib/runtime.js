'use strict';

import createDebug from 'debug';
import define from 'mixinable';

import isPlainObject from 'is-plain-object';

const debug = createDebug('untool:runtime');

const { override } = define;

const environmentalize = (_config) => {
  const _env = {};
  const env = global._env || process.env;
  const regExp = /\[(\w+?)\]/g;
  const replaceRecursive = (item) => {
    if (Array.isArray(item)) {
      return item.map(replaceRecursive);
    }
    if (isPlainObject(item)) {
      return Object.keys(item).reduce((result, key) => {
        result[key] = replaceRecursive(item[key]);
        return result;
      }, {});
    }
    if (regExp.test(item)) {
      return item.replace(regExp, (_, key) =>
        replaceRecursive((_env[key] = env[key] || ''))
      );
    }
    return item;
  };
  return Object.assign(replaceRecursive(_config), { _config, _env });
};

export class Mixin {
  constructor(config) {
    this.config = config;
  }
}

export function render(...renderArgs) {
  return (baseConfig, mixins) => {
    const config = environmentalize(baseConfig);
    const strategies = mixins.reduce(
      (result, mixin) => Object.assign({}, result, mixin.strategies),
      { render: override }
    );
    const createMixinable = define(strategies, mixins);

    debug(mixins.map(({ name, strategies }) => ({ [name]: strategies })));

    return function universalRender(...callArgs) {
      createMixinable(config, ...renderArgs).render(...callArgs);
    };
  };
}
