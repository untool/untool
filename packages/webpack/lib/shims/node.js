'use strict';

const { getConfigAndMixins } = require('./loader');

let entryPoint = require('@untool/entrypoint');
if (typeof entryPoint.default === 'function') {
  entryPoint = entryPoint.default;
}

const { config, mixins } = getConfigAndMixins();

module.exports = entryPoint(config, mixins);
