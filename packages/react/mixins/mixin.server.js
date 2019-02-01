'use strict';

const { parse } = require('url');

const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { default: StaticRouter } = require('react-router-dom/es/StaticRouter');
const {
  Helmet: { renderStatic },
} = require('react-helmet');

const {
  override,
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const getAssets = require('../lib/assets');
const template = require('../lib/template');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config, options);
    this.element = element;
    this.context = { modules: [] };
  }
  bootstrap(req, res) {
    this.url = parse(req.url);
    this.stats = res.locals.stats;
  }
  enhanceElement(element) {
    const { pathname, search } = this.url;
    const props = {
      ...this.options.router,
      location: { pathname, search },
      basename: this.config.basePath,
      context: this.context,
    };
    return createElement(StaticRouter, props, element);
  }
  render(req, res, next) {
    Promise.resolve()
      .then(() => this.bootstrap(req, res))
      .then(() => this.enhanceElement(this.element))
      .then((element) =>
        this.fetchData({}, element).then((fetchedData) => {
          const reactMarkup = renderToString(element);
          const fragments = Object.entries(renderStatic()).reduce(
            (result, [key, value]) => ({ ...result, [key]: value.toString() }),
            { reactMarkup, headPrefix: '', headSuffix: '' }
          );
          const assets = getAssets(this.stats, this.context.modules);
          const globals = { _env: this.config._env };
          return { fragments, assets, globals, fetchedData };
        })
      )
      .then((initialData) => {
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
