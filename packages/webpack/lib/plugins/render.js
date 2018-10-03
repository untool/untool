'use strict';

const indexFile = require('directory-index');
const { RawSource } = require('webpack-sources');

const {
  internal: {
    uri: { resolveAbsolute, resolveRelative },
  },
} = require('@untool/express');

exports.RenderPlugin = class RenderPlugin {
  constructor({ createRenderer, config: { basePath, locations } }) {
    const render = createRenderer();
    this.apply = (compiler) => {
      const toUrlPath = resolveAbsolute.bind(null, basePath);
      const toFsPath = resolveRelative.bind(null, basePath);
      const promise = Promise.all(
        locations.map((location) => render(toUrlPath(location)))
      );
      compiler.hooks.compilation.tap('RenderPlugin', (compilation) => {
        compilation.hooks.additionalAssets.tapPromise('RenderPlugin', () =>
          promise.then((responses) =>
            responses.forEach((response, index) => {
              const path = toFsPath(indexFile(locations[index]));
              compilation.assets[path] = new RawSource(response);
            })
          )
        );
      });
    };
  }
};
