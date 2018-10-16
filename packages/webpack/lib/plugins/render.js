'use strict';

const indexFile = require('directory-index');
const { RawSource } = require('webpack-sources');

const { trimLeadingSlash } = require('pathifist');

exports.RenderPlugin = class RenderPlugin {
  constructor(render, requests) {
    this.apply = (compiler) => {
      const promise = requests.then((requests) =>
        Promise.all(
          requests.map((request) =>
            render(request).then((content) => ({
              outfile:
                request.outfile || trimLeadingSlash(indexFile(request.url)),
              content,
            }))
          )
        )
      );
      compiler.hooks.compilation.tap('RenderPlugin', (compilation) => {
        compilation.hooks.additionalAssets.tapPromise('RenderPlugin', () =>
          promise.then((results) =>
            results.forEach(({ outfile, content }) => {
              compilation.assets[outfile] = new RawSource(content);
            })
          )
        );
      });
    };
  }
};
