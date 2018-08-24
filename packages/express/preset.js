'use strict';

const { join } = require('path');

module.exports = {
  https: false,
  host: '[HOST]',
  port: '[PORT]',
  locations: [],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: join('<rootDir>', 'dist'),
  mixins: [__dirname],
};
