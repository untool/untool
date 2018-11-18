'use strict';

const { existsSync: exists } = require('fs');
const { join } = require('path');

const {
  async: { override },
} = require('mixinable');

const { join: joinUrl, ensureLeadingSlash } = require('pathifist');

const { Mixin } = require('@untool/core');

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
  configureBuild(webpackConfig, loaderConfigs, target) {
    if (target === 'build' && this.options.static) {
      const { plugins } = webpackConfig;
      const { RenderPlugin } = require('../../lib/plugins/render');
      plugins.push(
        new RenderPlugin(this.createRenderer(), this.getRenderRequests())
      );
    }
  }
  configureServer(app, middlewares, mode) {
    if (mode === 'static' || mode === 'develop') {
      const createRenderMiddleware = require('../../lib/middlewares/render');
      const webpackNodeConfig = this.getBuildConfig('node');
      middlewares.routes.push(
        createRenderMiddleware(webpackNodeConfig, mode === 'develop')
      );
    }
    if (mode === 'serve') {
      const { serverDir, serverFile } = this.config;
      const serverFilePath = join(serverDir, serverFile);
      if (exists(serverFilePath)) {
        middlewares.routes.push(require(serverFilePath));
      }
    }
  }
  configureCommand({ command, builder }) {
    if (command === 'start' || command === 'build') {
      builder.static = {
        alias: 's',
        default: false,
        describe: 'Statically build locations',
        type: 'boolean',
      };
    }
  }
  handleArguments(argv) {
    this.options = { ...this.options, ...argv };
  }
}

WebpackRenderMixin.strategies = {
  getRenderRequests: override,
};

module.exports = WebpackRenderMixin;
