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
    join(__dirname, 'mixins', 'build'),
    join(__dirname, 'mixins', 'config'),
    join(__dirname, 'mixins', 'develop'),
    join(__dirname, 'mixins', 'render'),
    join(__dirname, 'mixins', 'start'),
    join(__dirname, 'mixins', 'stats'),
  ],
};
