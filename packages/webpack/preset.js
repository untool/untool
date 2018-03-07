module.exports = {
  browsers: '> 1%, last 2 versions, Firefox ESR',
  node: 'current',
  assetFile: 'assets.json',
  assetTypes: ['js', 'css'],
  assetNames: ['<vendorName>', '<namespace>'],
  vendorName: 'vendor',
  cssModules: '[folder]-[name]-[local]-[hash:8]',
  mixins: [__dirname],
};
