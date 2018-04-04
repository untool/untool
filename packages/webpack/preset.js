module.exports = {
  browsers: 'defaults',
  node: 'current',
  serverFile: 'server.js',
  assetFile: 'assets.json',
  cssModules: '[folder]-[name]-[local]-[hash:8]',
  env: {
    production: {
      cssModules: '[hash:12]',
    },
  },
  mixins: [__dirname],
};
