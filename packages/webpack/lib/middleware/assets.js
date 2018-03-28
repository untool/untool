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
    assetsByType: { css: [], js: [] },
  });
  Object.keys(assetsByChunkName)
    .filter(chunkName =>
      new RegExp(`^(vendors~)?${config.namespace}$`).test(chunkName)
    )
    .forEach(chunkName => {
      const assets = Array.isArray(assetsByChunkName[chunkName])
        ? assetsByChunkName[chunkName]
        : [assetsByChunkName[chunkName]];
      Object.keys(assetsByType).forEach(extension => {
        assetsByType[extension].push(
          ...assets.filter(asset => asset && extname(asset) === `.${extension}`)
        );
      });
    });
  next();
};
