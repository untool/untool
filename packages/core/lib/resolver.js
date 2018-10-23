'use strict';

const {
  sync: resolve,
  create: { sync: createResolver },
} = require('enhanced-resolve');

const mixinResolvers = {};

const resolveMixin = (types, ...args) => {
  try {
    const key = types.join('__');
    if (!mixinResolvers[key]) {
      mixinResolvers[key] = createResolver({
        mainFiles: [...types.map((type) => `mixin.${type}`), 'mixin'],
        mainFields: [...types.map((type) => `mixin:${type}`), 'mixin'],
      });
    }
    return mixinResolvers[key](...args);
  } catch (error) {
    return null;
  }
};

exports.resolve = resolve;

exports.resolvePreset = createResolver({
  mainFiles: ['preset'],
  mainFields: ['preset'],
});

exports.isResolveError = (error) =>
  error && error.message && error.message.startsWith("Can't resolve");

exports.createMixinResolver = (mixinTypes) => ({
  resolveMixins(context, mixins) {
    return mixins.reduce((result, mixin) => {
      let found = false;
      Object.entries(mixinTypes).forEach(([key, types]) => {
        const typeMixin = resolveMixin(types, context, mixin);
        if (typeMixin) {
          if (!result[key] || !result[key].includes(typeMixin)) {
            result[key] = [...(result[key] || []), typeMixin];
          }
          found = true;
        }
      });
      if (!found) {
        throw new Error(`Can't find mixin '${mixin}'`);
      }
      return result;
    }, {});
  },
});
