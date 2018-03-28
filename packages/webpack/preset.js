module.exports = {
  browsers: 'defaults',
  node: 'current',
  assetFile: 'assets.json',
  cssModules: '[folder]-[name]-[local]-[hash:8]',
  mixins: [__dirname],
  env: {
    production: {
      cssModules: '[hash:12]',
    },
  },
};
