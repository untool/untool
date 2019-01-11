'use strict';

const { compatibleMessage } = require('check-error');

const {
  sync: resolve,
  create: { sync: createResolver },
} = require('enhanced-resolve');

const resolvePreset = createResolver({
  mainFiles: ['preset'],
  mainFields: ['preset'],
});

const resolveCoreMixin = createResolver({
  mainFiles: ['mixin.core', 'mixin'],
  mainFields: ['mixin:core', 'mixin'],
});

const resolveBrowserMixin = createResolver({
  mainFiles: ['mixin.browser', 'mixin.runtime', 'mixin'],
  mainFields: ['mixin:browser', 'mixin:runtime', 'mixin'],
});

const resolveServerMixin = createResolver({
  mainFiles: ['mixin.server', 'mixin.runtime', 'mixin'],
  mainFields: ['mixin:server', 'mixin:runtime', 'mixin'],
});

exports.resolve = resolve;

exports.resolvePreset = resolvePreset;

exports.resolveMixins = (context, mixins) => {
  const resolvers = {
    core: resolveCoreMixin,
    browser: resolveBrowserMixin,
    server: resolveServerMixin,
  };
  const result = { core: [], browser: [], server: [] };
  return mixins.reduce((result, mixin) => {
    const found = Object.entries(resolvers).reduce((found, [key, resolve]) => {
      try {
        return !!result[key].push(resolve(context, mixin));
      } catch (error) {
        if (!exports.isResolveError(error)) throw error;
        return found;
      }
    }, false);
    if (!found) {
      throw new Error(`Can't find mixin '${mixin}' in '${context}'`);
    }
    return result;
  }, result);
};

exports.isResolveError = (error) => compatibleMessage(error, /^Can't resolve/);
