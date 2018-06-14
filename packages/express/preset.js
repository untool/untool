module.exports = {
  https: false,
  host: process.env.HOST,
  port: process.env.PORT,
  locations: [],
  basePath: '',
  assetPath: '<basePath>',
  buildDir: '<rootDir>/dist',
  mixins: [__dirname],
};
