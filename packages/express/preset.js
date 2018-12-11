'use strict';

const { join } = require('path');

module.exports = {
  https: false,
  host: '[HOST]',
  port: '[PORT]',
  distDir: join('<buildDir>', 'public'),
  mixins: [join(__dirname, 'mixins')],
};
