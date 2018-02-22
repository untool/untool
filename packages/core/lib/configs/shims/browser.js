'use strict';

require('babel-polyfill');

(function render() {
  var entryPoint = require('@@ENTRYPOINT@@');
  if (entryPoint.__esModule) {
    entryPoint = entryPoint.default;
  }
  entryPoint();
  if (module.hot) {
    module.hot.accept(require.resolve('@@ENTRYPOINT@@'), function() {
      setTimeout(render);
    });
  }
})();
