module.exports = {
  https: false,
  ip: process.env.IP,
  port: process.env.PORT,
  locations: ['/**'],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: '<rootDir>/dist',
  serverFile: 'server.js',
  mixins: [__dirname],
};
