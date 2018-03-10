module.exports = {
  https: false,
  ip: process.env.IP || '0.0.0.0',
  port: process.env.PORT || 8080,
  findPort: process.env.NODE_ENV !== 'production',
  locations: ['/**'],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: '<rootDir>/dist',
  serverFile: 'server.js',
  mixins: [__dirname],
};
