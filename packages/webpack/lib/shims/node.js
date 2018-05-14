'use strict';

require('babel-polyfill');

var { getConfig } = require('@untool/config');
var entryPoint = require('@untool/entrypoint');

if (typeof entryPoint.default === 'function') {
  entryPoint = entryPoint.default;
}

module.exports = entryPoint(getConfig());
