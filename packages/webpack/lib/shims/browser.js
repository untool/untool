'use strict';

require('babel-polyfill');

var { getConfig } = require('@untool/config');

(function render() {
  var entryPoint = require('@untool/entrypoint');
  if (typeof entryPoint.default === 'function') {
    entryPoint = entryPoint.default;
  }
  entryPoint(getConfig())();
  if (module.hot) {
    module.hot.accept(require.resolve('@untool/entrypoint'), function() {
      setTimeout(render);
    });
  }
})();
