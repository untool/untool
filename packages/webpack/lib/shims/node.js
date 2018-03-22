'use strict';

var { getConfig } = require('@untool/config');
var entryPoint = require('@untool/entrypoint');

if (entryPoint.__esModule) {
  entryPoint = entryPoint.default;
}

module.exports = entryPoint(getConfig());
