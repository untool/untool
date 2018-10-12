'use strict';

const indexFile = require('directory-index');
const { RawSource } = require('webpack-sources');

const {
  internal: {
    uri: { trimLeadingSlash },
  },
} = require('@untool/express');

exports.RenderPlugin = class RenderPlugin {
  constructor(render, requests) {
    this.apply = (compiler) => {
      const promise = requests.then((requests) =>
        Promise.all(
          requests.map((request) =>
            render(request).then((response) => ({
              path: trimLeadingSlash(indexFile(request.url)),
              response,
            }))
          )
        )
      );
      compiler.hooks.compilation.tap('RenderPlugin', (compilation) => {
        compilation.hooks.additionalAssets.tapPromise('RenderPlugin', () =>
          promise.then((responses) =>
            responses.forEach(({ path, response }) => {
              compilation.assets[path] = new RawSource(response);
            })
          )
        );
      });
    };
  }
};
