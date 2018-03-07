module.exports = {
  https: false,
  host: '0.0.0.0',
  port: 8080,
  locations: ['/**'],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: '<rootDir>/dist',
  serverFile: 'server.js',
  mixins: [__dirname],
};
