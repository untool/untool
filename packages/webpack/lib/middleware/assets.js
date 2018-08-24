'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

module.exports = (getAssets, config) => {
  const file = join(config.serverDir, config.assetFile);
  const fileExists = exists(file);
  return function assetsMiddleware(req, res, next) {
    (getAssets() || Promise.resolve(fileExists && require(file))).then(
      (assets) => (res.locals = { ...(res.locals || {}), ...assets }) && next()
    );
  };
};
