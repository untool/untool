'use strict';

const { join } = require('path');

module.exports = {
  browsers: ['defaults'],
  node: 'current',
  locations: [],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: join('<rootDir>', 'dist'),
  serverDir: '<buildDir>',
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
