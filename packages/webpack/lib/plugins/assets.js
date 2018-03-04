import { RawSource } from 'webpack-sources';

export default class WebpackAssetsPlugin {
  constructor(options, config, setAssets) {
    this.config = config;
    this.options = options;
    this.setAssets = setAssets;
  }
  apply(compiler) {
    compiler.hooks.emit.tap('untool-assets', compilation => {
      const assets = Object.keys(compilation.assets);
      const chunkNames = Array.from(compilation.namedChunks.keys());
      const assetsByChunkName = chunkNames.reduce(
        (result, key) => ({
          ...result,
          [key]: compilation.namedChunks.get(key).files,
        }),
        {}
      );
      if (this.options.static) {
        this.setAssets(assets, assetsByChunkName);
      } else {
        compilation.assets[this.config.assetFile] = new RawSource(
          JSON.stringify({
            assets: assets,
            assetsByChunkName: assetsByChunkName,
          })
        );
      }
    });
  }
}
