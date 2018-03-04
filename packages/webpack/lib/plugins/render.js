import { RawSource } from 'webpack-sources';

export default class WebpackRenderPlugin {
  constructor(render) {
    this.render = render;
  }
  apply(compiler) {
    compiler.hooks.emit.tapPromise('untool-render', compilation =>
      this.render().then(pages => {
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
}
