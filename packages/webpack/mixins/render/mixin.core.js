'use strict';

const {
  async: { override },
} = require('mixinable');

const { join: joinUrl, ensureLeadingSlash } = require('pathifist');

const {
  Mixin,
  internal: { validate, invariant },
} = require('@untool/core');

class WebpackRenderMixin extends Mixin {
  getRenderRequests() {
    const { locations, basePath } = this.config;
    return locations.map((location) => {
      const isString = typeof location === 'string';
      const url = ensureLeadingSlash(
        joinUrl(basePath, isString ? location : location.url)
      );
      return isString ? { url } : { ...location, url };
    });
  }
  configureBuild(webpackConfig, loaderConfigs, { target, watch }) {
    if (target === 'browser' && !watch) {
      const { plugins } = webpackConfig;
      const { RenderPlugin } = require('../../lib/plugins/render');
      plugins.push(
        new RenderPlugin(this.createRenderer(), this.getRenderRequests())
      );
    }
  }
  configureServer(app, middlewares, mode) {
    const createRenderMiddleware = require('../../lib/middlewares/render');
    middlewares.routes.push(
      createRenderMiddleware(
        mode === 'static' || mode === 'develop',
        mode === 'develop',
        this
      )
    );
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

WebpackRenderMixin.strategies = {
  getRenderRequests: validate(
    override,
    ({ length }) => {
      invariant(
        length === 0,
        'getRenderRequests(): Received unexpected argument(s)'
      );
    },
    (result) => {
      invariant(
        Array.isArray(result),
        'getRenderRequests(): Returned invalid requests array'
      );
    }
  ),
};

module.exports = WebpackRenderMixin;
