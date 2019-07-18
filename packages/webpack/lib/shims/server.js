'use strict';

require('source-map-support/register');
require('core-js');

if (module.hot) {
  require('webpack/hot/log').setLogLevel('none');
  module.hot.accept('@untool/entrypoint');
}

module.exports = (...args) => {
  return require('@untool/entrypoint').default(...args);
};
