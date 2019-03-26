'use strict';

if (!require('module').prototype._compile.__sourceMapSupport) {
  require('source-map-support/register');
}
require('@babel/polyfill');

if (module.hot) {
  require('webpack/hot/log').setLogLevel('none');
  module.hot.accept('@untool/entrypoint');
}

module.exports = (...args) => {
  return require('@untool/entrypoint').default(...args);
};
