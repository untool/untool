'use strict';

const { RawSource } = require('webpack-sources');

module.exports = class WebpackRenderPlugin {
  constructor(render) {
    this.render = render;
  }
  apply(compiler) {
    compiler.hooks.emit.tapPromise('untool-render', (compilation) =>
      this.render().then((pages) => {
        Object.assign(
          compilation.assets,
          Object.keys(pages).reduce(
            (result, key) => ({
              ...result,
              [key]: new RawSource(pages[key]),
            }),
            {}
          )
        );
      })
    );
  }
};
