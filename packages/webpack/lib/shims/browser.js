'use strict';

require('babel-polyfill');

const { getConfigAndMixins } = require('@untool/config');

(function render() {
  let entryPoint = require('@untool/entrypoint');
  if (typeof entryPoint.default === 'function') {
    entryPoint = entryPoint.default;
  }

  const { config, mixins } = getConfigAndMixins();
  entryPoint(config, mixins)();

  if (module.hot) {
    module.hot.accept(require.resolve('@untool/entrypoint'), function() {
      setTimeout(render);
    });
  }
})();
