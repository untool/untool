'use strict';

const { RawSource } = require('webpack-sources');

module.exports = class RenderPlugin {
  constructor({ renderLocations }) {
    this.apply = (compiler) =>
      compiler.hooks.compilation.tap('RenderPlugin', (compilation) =>
        compilation.hooks.additionalAssets.tapPromise('RenderPlugin', () =>
          renderLocations().then((pages) => {
            const pageAssets = Object.keys(pages).reduce(
              (result, location) => ({
                ...result,
                [location]: new RawSource(pages[location]),
              }),
              {}
            );
            Object.assign(compilation.assets, pageAssets);
          })
        )
      );
  }
};
