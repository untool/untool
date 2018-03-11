const { join, extname } = require('path');

const cachedAssetData = {};

const getAssetData = (locals = {}, config) => {
  if (locals.webpackStats) {
    const { assets, assetsByChunkName } = locals.webpackStats.toJson();
    return { assets, assetsByChunkName };
  }
  if (!cachedAssetData.assets) {
    try {
      const assetFile = join(config.buildDir, config.assetFile);
      require.resolve(assetFile);
      Object.assign(cachedAssetData, require(assetFile));
    } catch (_) {
      Object.assign(cachedAssetData, { assets: {}, assetsByChunkName: {} });
    }
  }
  return cachedAssetData;
};

module.exports = (config, assetData) => (req, res, next) => {
  assetData = assetData && assetData.assets ? assetData : null;
  const { assetsByType, assetsByChunkName } = (res.locals = {
    ...res.locals,
    ...(assetData || getAssetData(res.locals, config)),
    assetsByType: config.assetTypes.reduce(
      (result, extension) => ({ ...result, [extension]: [] }),
      {}
    ),
  });
  config.assetNames.forEach(chunkName => {
    const assets = Array.isArray(assetsByChunkName[chunkName])
      ? assetsByChunkName[chunkName]
      : [assetsByChunkName[chunkName]];
    config.assetTypes.forEach(extension => {
      const asset = assets.find(
        asset => asset && extname(asset) === `.${extension}`
      );
      if (asset) {
        assetsByType[extension].push(asset);
      }
    });
  });
  next();
};
