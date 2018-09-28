'use strict';

const {
  sync: resolve,
  create: { sync: createResolver },
} = require('enhanced-resolve');

exports.resolve = resolve;

exports.resolvePreset = createResolver({
  mainFiles: ['preset'],
  mainFields: ['preset'],
});

exports.resolveMixin = (types, ...args) => {
  try {
    return createResolver({
      mainFiles: [...types.map((type) => `mixin.${type}`), 'mixin'],
      mainFields: [...types.map((type) => `mixin:${type}`), 'mixin'],
    })(...args);
  } catch (error) {
    return null;
  }
};

exports.resolveMixins = (context, mixins, types) =>
  mixins.reduce((result, mixin) => {
    let found = false;
    Object.keys(types).forEach((type) => {
      const typeMixin = exports.resolveMixin(types[type], context, mixin);
      if (typeMixin) {
        result[type] = result[type] || [];
        if (!result[type].includes(typeMixin)) {
          result[type].push(typeMixin);
        }
        found = true;
      }
    });
    if (!found) {
      throw new Error(`Can't find mixin '${mixin}'`);
    }
    return result;
  }, {});

exports.isResolveError = (error) =>
  error && error.message && error.message.startsWith("Can't resolve");
