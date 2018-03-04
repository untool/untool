'use strict';

require('babel-polyfill');

var config = require('@untool/config');

(function render() {
  var entryPoint = require('@untool/entrypoint');
  if (entryPoint.__esModule) {
    entryPoint = entryPoint.default;
  }
  entryPoint(config.getConfig(), config.getPlugins())();
  if (module.hot) {
    module.hot.accept(require.resolve('@untool/entrypoint'), function() {
      setTimeout(render);
    });
  }
})();
