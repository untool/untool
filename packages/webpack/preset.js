'use strict';

const { join } = require('path');

module.exports = {
  browsers: 'defaults',
  node: 'current',
  locations: [],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: '<distDir>',
  serverDir: join('<rootDir>', 'node_modules', '.cache', 'untool'),
  serverFile: 'server.js',
  statsFile: 'stats.json',
  mixins: [__dirname],
};
