module.exports = {
  https: false,
  ip: process.env.IP,
  port: process.env.PORT,
  locations: ['/**'],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: '<rootDir>/dist',
  env: {
    production: {
      compress: true,
    },
  },
  mixins: [__dirname],
};
