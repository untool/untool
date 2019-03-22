'use strict';

if (!require('module').prototype._compile.__sourceMapSupport) {
  require('source-map-support/register');
}
require('@babel/polyfill');

module.exports = (...args) => {
  return require('@untool/entrypoint').default(...args);
};
