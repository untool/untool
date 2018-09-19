'use strict';

const { extname } = require('path');

const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { default: StaticRouter } = require('react-router-dom/StaticRouter');
const { Helmet } = require('react-helmet');

const {
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config);
    this.element = element;
    this.modules = [];
    this.options = Object.assign(
      {
        context: { modules: this.modules },
        basename: config.basePath,
      },
      options && options.router
    );
  }
  procureAssets() {
    const { stats, modules } = this;
    const { moduleIds, chunks, assetsByChunkName } = stats;
    const ids = modules.map(({ module }) => moduleIds[module]);
    const isCssJs = RegExp.prototype.test.bind(/\.(css|js)$/);
    const isUpdate = RegExp.prototype.test.bind(/\.hot-update\./);
    const isVendor = RegExp.prototype.test.bind(/vendors~/);
    const isChunk = RegExp.prototype.test.bind(/chunk~/);
    return Object.values(assetsByChunkName)
      .concat(
        chunks
          .filter(({ modules }) => modules.find(({ id }) => ids.includes(id)))
          .map(({ files }) => files)
      )
      .reduce((result, array) => result.concat(array), [])
      .filter((asset, index, self) => self.indexOf(asset) === index)
      .filter((asset) => isCssJs(asset) && !isUpdate(asset))
      .sort((a, b) => {
        if (isVendor(a)) return isVendor(b) ? a.localeCompare(b) * -1 : 1;
        if (isVendor(b)) return -1;
        if (isChunk(a)) return isChunk(b) ? a.localeCompare(b) * -1 : 1;
        if (isChunk(b)) return -1;
        return a.localeCompare(b) * -1;
      })
      .reverse()
      .reduce(
        (result, asset) => {
          const extension = extname(asset).substring(1);
          result[extension].push(asset);
          return result;
        },
        { css: [], js: [] }
      );
  }
  procureTemplateData(data) {
    const { name: mountpoint, _env } = this.config;
    const { helmet } = data;
    const fragments = Object.keys(helmet).reduce(
      (result, key) => Object.assign(result, { [key]: helmet[key].toString() }),
      { headPrefix: '', headSuffix: '' }
    );
    const assets = this.procureAssets();
    return this.getTemplateData(
      Object.assign(data, { assets, mountpoint, fragments, globals: { _env } })
    );
  }
  bootstrap(req, res) {
    this.options.location = req.path;
    this.stats = res.locals.stats;
  }
  enhanceElement(element) {
    return createElement(StaticRouter, this.options, element);
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then((data) => ({ element, data }))
      )
      .then(({ element, data: fetchedData }) => {
        const markup = renderToString(element);
        const helmet = Helmet.renderStatic();
        const { context } = this.options;
        if (context.miss) {
          next();
        } else if (context.url) {
          context.headers && res.set(context.headers);
          res.redirect(context.status || 301, context.url);
        } else {
          context.headers && res.set(context.headers);
          res.status(context.status || 200);
          return this.procureTemplateData({ fetchedData, markup, helmet }).then(
            (templateData) => res.send(template(templateData))
          );
        }
      })
      .catch(next);
  }
}

ReactMixin.strategies = {
  bootstrap: parallel,
  enhanceElement: compose,
  fetchData: pipe,
  getTemplateData: pipe,
};

module.exports = ReactMixin;
