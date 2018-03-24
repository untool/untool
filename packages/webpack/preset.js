module.exports = {
  browsers: 'defaults',
  node: 'current',
  assetFile: 'assets.json',
  assetTypes: ['js', 'css'],
  assetNames: ['<vendorName>', '<namespace>'],
  vendorName: 'vendor',
  cssModules: '[folder]-[name]-[local]-[hash:8]',
  mixins: [__dirname],
};
