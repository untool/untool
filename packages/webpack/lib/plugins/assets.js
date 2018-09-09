'use strict';

const { extname } = require('path');

const { RawSource } = require('webpack-sources');

module.exports = exports = class WebpackAssetDataPlugin {
  constructor({ assets: resolvable, config }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tap('untool-assets', ({ namedChunks: chunks }) => {
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
        resolvable.resolve({ assetsByChunkName, assetsByType });
      });
    };
  }
};

exports.AssetManifestPlugin = class WebpackAssetManifestPlugin {
  constructor({ assets: resolvable, config }) {
    this.apply = (compiler) => {
      compiler.hooks.emit.tapPromise('untool-assets', ({ assets }) =>
        resolvable.then(
          (data) =>
            (assets[config.assetFile] = new RawSource(JSON.stringify(data)))
        )
      );
    };
  }
};
