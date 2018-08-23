'use strict';

const { join, extname } = require('path');

module.exports = (config, getAssets) => {
  return function assetsMiddleware(req, res, next) {
    const assetsFile = join(config.buildDir, config.assetFile);
    const assetsByChunkName = getAssets() || require(assetsFile);
    const assetsByType = Object.entries(assetsByChunkName)
      .filter(([name]) => new RegExp(`^(vendors~)?${config.name}$`).test(name))
      .sort(([name]) => (name.startsWith('vendors~') ? 0 : 1))
      .map(([name, assets]) => [
        name,
        Array.isArray(assets) ? assets : [assets],
      ])
      .reduce(
        (result, [, assets]) =>
          assets.reduce((result, asset) => {
            const extension = extname(asset).substring(1);
            if (result[extension] && !asset.endsWith('.hot-update.js')) {
              result[extension].push(asset);
            }
            return result;
          }, result),
        { css: [], js: [] }
      );
    res.locals = { ...(res.locals || {}), assetsByChunkName, assetsByType };
    next();
  };
};
