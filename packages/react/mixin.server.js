'use strict';

const { extname } = require('path');
const { parse } = require('url');

const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { default: StaticRouter } = require('react-router-dom/es/StaticRouter');
const { Helmet } = require('react-helmet');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config, options);
    this.element = element;
    const { basePath: basename } = config;
    const modules = (this.modules = []);
    const context = (this.context = { modules });
    this.options = { ...(options && options.router), basename, context };
  }
  determineAssets() {
    const { entryFiles, vendorFiles, moduleFileMap } = this.stats;
    const moduleFiles = this.modules.reduce(
      (result, module) => [...result, ...moduleFileMap[module]],
      []
    );
    return [
      ...vendorFiles.sort((a, b) => b.localeCompare(a)),
      ...moduleFiles.sort((a, b) => b.localeCompare(a)),
      ...entryFiles.sort((a, b) => b.localeCompare(a)),
    ]
      .filter(
        (asset, index, self) =>
          self.indexOf(asset) === index &&
          /\.(css|js)$/.test(asset) &&
          !/\.hot-update\./.test(asset)
      )
      .reduce(
        (result, asset) => {
          const extension = extname(asset).substring(1);
          result[extension].push(asset);
          return result;
        },
        { css: [], js: [] }
      );
  }
  getInitialTemplateData({ helmet, ...data }) {
    const { name: mountpoint, _env } = this.config;
    const assets = this.determineAssets();
    const fragments = Object.entries(helmet).reduce(
      (result, [key, value]) => ({ ...result, [key]: value.toString() }),
      { headPrefix: '', headSuffix: '' }
    );
    const globals = { _env };
    return { ...data, mountpoint, assets, fragments, globals };
  }
  bootstrap(req, res) {
    const { pathname, search } = parse(req.url);
    this.options.location = { pathname, search };
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
        const initialData = this.getInitialTemplateData({
          markup: renderToString(element),
          helmet: Helmet.renderStatic(),
          fetchedData,
        });
        if (this.context.miss) {
          next();
        } else if (this.context.url) {
          this.context.headers && res.set(this.context.headers);
          res.redirect(this.context.status || 301, this.context.url);
        } else {
          this.context.headers && res.set(this.context.headers);
          res.status(this.context.status || 200);
          return this.getTemplateData(initialData).then((templateData) =>
            res.send(template(templateData))
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
  render: override,
};

module.exports = ReactMixin;
