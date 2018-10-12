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
  mixins: [
    join(__dirname, 'lib', 'mixins', 'build'),
    join(__dirname, 'lib', 'mixins', 'config'),
    join(__dirname, 'lib', 'mixins', 'develop'),
    join(__dirname, 'lib', 'mixins', 'render'),
    join(__dirname, 'lib', 'mixins', 'start'),
    join(__dirname, 'lib', 'mixins', 'stats'),
  ],
};
