'use strict';

const { extname } = require('path');

const { RawSource } = require('webpack-sources');

module.exports = class WebpackAssetsPlugin {
  constructor(assets, config, target) {
    this.assets = assets;
    this.config = config;
    this.target = target;
  }
  apply(compiler) {
    const { config, target } = this;
    if (target === 'node') {
      compiler.hooks.emit.tapPromise('untool-assets', (compilation) =>
        this.assets.then(
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
        this.assets.resolve({ assetsByChunkName, assetsByType });
      });
    }
  }
};
