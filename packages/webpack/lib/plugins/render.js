'use strict';

const { RawSource } = require('webpack-sources');

module.exports = class RenderPlugin {
  constructor({ renderLocations }) {
    this.apply = (compiler) =>
      compiler.hooks.compilation.tap('RenderPlugin', (compilation) =>
        compilation.hooks.additionalAssets.tapPromise('RenderPlugin', () =>
          renderLocations().then((pages) =>
            Object.keys(pages).forEach(
              (location) =>
                (compilation.assets[location] = new RawSource(pages[location]))
            )
          )
        )
      );
  }
};
