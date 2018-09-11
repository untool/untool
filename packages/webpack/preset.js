'use strict';

const { join } = require('path');

module.exports = {
  browsers: 'defaults',
  node: 'current',
  serverDir: join('<rootDir>', 'node_modules', '.cache', 'untool'),
  serverFile: 'server.js',
  statsFile: 'stats.json',
  mixins: [__dirname],
};
