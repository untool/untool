'use strict';

const { RawSource } = require('webpack-sources');

module.exports = class RenderPlugin {
  constructor({ renderLocations }) {
    this.apply = (compiler) =>
      compiler.hooks.compilation.tap('RenderPlugin', (compilation) =>
        compilation.hooks.additionalAssets.tapPromise('RenderPlugin', () =>
          renderLocations().then((pages) =>
            Object.entries(pages).forEach(
              ([path, page]) => (compilation.assets[path] = new RawSource(page))
            )
          )
        )
      );
  }
};
