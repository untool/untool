'use strict';

const { join } = require('path');

module.exports = {
  https: false,
  host: '[HOST]',
  port: '[PORT]',
  distDir: join('<rootDir>', 'dist'),
  mixins: [__dirname],
};
