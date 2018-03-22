'use strict';

var { getConfig } = require('@untool/config');

(function render() {
  var entryPoint = require('@untool/entrypoint');
  if (entryPoint.__esModule) {
    entryPoint = entryPoint.default;
  }
  entryPoint(getConfig())();
  if (module.hot) {
    module.hot.accept(require.resolve('@untool/entrypoint'), function() {
      setTimeout(render);
    });
  }
})();
