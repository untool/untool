'use strict';

require('babel-polyfill');

const { getConfigAndMixins } = require('@untool/config');

let entryPoint = require('@untool/entrypoint');
if (typeof entryPoint.default === 'function') {
  entryPoint = entryPoint.default;
}

const { config, mixins } = getConfigAndMixins();

module.exports = entryPoint(config, mixins);
