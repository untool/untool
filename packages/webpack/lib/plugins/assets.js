'use strict';

const { RawSource } = require('webpack-sources');

module.exports = class WebpackAssetsPlugin {
  constructor(options, config, setAssets) {
    this.config = config;
    this.options = options;
    this.setAssets = setAssets;
  }
  apply(compiler) {
    compiler.hooks.emit.tap('untool-assets', (compilation) => {
      const chunkNames = Array.from(compilation.namedChunks.keys());
      const assetsByChunkName = chunkNames.reduce(
        (result, key) => ({
          ...result,
          [key]: compilation.namedChunks.get(key).files,
        }),
        {}
      );
      if (this.options.static) {
        this.setAssets(assetsByChunkName);
      } else {
        compilation.assets[this.config.assetFile] = new RawSource(
          JSON.stringify(assetsByChunkName)
        );
      }
    });
    compiler.hooks.done.tap('untool-assets', (stats) => {
      const { assetsByChunkName } = stats.toJson();
      this.setAssets(assetsByChunkName);
    });
  }
};
