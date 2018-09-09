'use strict';

const { RawSource } = require('webpack-sources');

module.exports = class WebpackRenderPlugin {
  constructor({ renderLocations }) {
    this.apply = (compiler) =>
      compiler.hooks.emit.tapPromise('untool-render', ({ assets }) =>
        renderLocations().then((pages) => {
          const pageAssets = Object.keys(pages).reduce(
            (result, key) => ({ ...result, [key]: new RawSource(pages[key]) }),
            {}
          );
          Object.assign(assets, pageAssets);
        })
      );
  }
};
