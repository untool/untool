import { join, extname } from 'path';

import config from '../../config';

const getAssetData = (locals = {}) => {
  if (locals.assets && locals.assetsByChunkName) {
    return locals;
  }
  if (locals.webpackStats) {
    const { assets, assetsByChunkName } = locals.webpackStats.toJson();
    return { assets, assetsByChunkName };
  }
  return require(join(config.buildDir, config.assetFile));
};

export default () => (req, res, next) => {
  const { assetsByType, assetsByChunkName } = (res.locals = {
    ...res.locals,
    ...getAssetData(res.locals),
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
