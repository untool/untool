'use strict';

require('babel-polyfill');

var entryPoint = require('@@ENTRYPOINT@@');

if (entryPoint.__esModule) {
  module.exports = entryPoint.default;
} else {
  module.exports = entryPoint;
}
