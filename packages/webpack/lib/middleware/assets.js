const { existsSync: exists } = require('fs');
const { join, extname } = require('path');

const getAssetData = (locals = {}, config) => {
  if (locals.webpackStats) {
    const { assets, assetsByChunkName } = locals.webpackStats.toJson();
    return { assets, assetsByChunkName };
  }
  const file = join(config.buildDir, config.assetFile);
  return exists(file) ? require(file) : { assets: {}, assetsByChunkName: {} };
};

module.exports = (config, assetData) => (req, res, next) => {
  assetData = assetData && assetData.assets ? assetData : null;
  const { assetsByType, assetsByChunkName } = (res.locals = {
    ...res.locals,
    ...(assetData || getAssetData(res.locals, config)),
    assetsByType: { css: [], js: [] },
  });
  Object.keys(assetsByChunkName)
    .filter(chunkName =>
      new RegExp(`^(vendors~)?${config.namespace}$`).test(chunkName)
    )
    .forEach(chunkName => {
      const chunkAssets = assetsByChunkName[chunkName];
      const assets = Array.isArray(chunkAssets) ? chunkAssets : [chunkAssets];
      Object.keys(assetsByType).forEach(extension => {
        assetsByType[extension].push(
          ...assets.filter(asset => asset && extname(asset) === `.${extension}`)
        );
      });
    });
  next();
};
