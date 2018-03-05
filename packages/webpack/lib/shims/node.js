'use strict';

require('babel-polyfill');

var config = require('@untool/config');
var entryPoint = require('@untool/entrypoint');

if (entryPoint.__esModule) {
  entryPoint = entryPoint.default;
}

module.exports = entryPoint(config.getConfig(), config.getMixins());
