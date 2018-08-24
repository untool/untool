'use strict';

const { extname } = require('path');

const { RawSource } = require('webpack-sources');

let resolve;
let promise = new Promise((_resolve) => (resolve = _resolve)).then(
  (assets) =>
    (resolve = (assets) => (promise = Promise.resolve(assets))) && assets
);

module.exports = class WebpackAssetsPlugin {
  constructor(setAssets, config, target) {
    this.setAssets = setAssets;
    this.config = config;
    this.target = target;
  }
  apply(compiler) {
    const { config, target } = this;
    if (target === 'node') {
      compiler.hooks.emit.tapPromise('untool-assets', (compilation) =>
        promise.then(
          (assets) =>
            (compilation.assets[config.assetFile] = new RawSource(
              JSON.stringify(assets)
            ))
        )
      );
    } else {
      compiler.hooks.emit.tap('untool-assets', (compilation) => {
        const { namedChunks: chunks } = compilation;
        const assetsByChunkName = Array.from(chunks.keys()).reduce(
          (result, key) => ({ ...result, [key]: chunks.get(key).files }),
          {}
        );
        const assetsByType = Object.entries(assetsByChunkName)
          .filter(([name]) =>
            new RegExp(`^(vendors~)?${config.name}$`).test(name)
          )
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
        resolve({ assetsByChunkName, assetsByType });
        this.setAssets(promise);
      });
    }
  }
};
