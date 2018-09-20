'use strict';

const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { default: StaticRouter } = require('react-router-dom/StaticRouter');
const { Helmet } = require('react-helmet');
const clone = require('clone');

const {
  async: { compose, parallel, pipe },
} = require('mixinable');

const { Mixin } = require('@untool/core');

const template = require('./lib/template');

class ReactMixin extends Mixin {
  constructor(config, element, options) {
    super(config);
    this.element = element;
    this.options = Object.assign(
      {
        context: {},
        basename: config.basePath,
      },
      options && options.router
    );
  }
  bootstrap(req, res) {
    this.options.location = req.path;
    this.assets = clone(res.locals.stats.entryAssetsByType);
  }
  enhanceElement(element) {
    return createElement(StaticRouter, this.options, element);
  }
  procureTemplateData(data) {
    const { helmet } = data;
    const { assets, config } = this;
    const { name: mountpoint, _env } = config;
    const globals = { _env };
    const fragments = Object.keys(helmet).reduce(
      (result, key) => Object.assign(result, { [key]: helmet[key].toString() }),
      { headPrefix: '', headSuffix: '' }
    );
    return this.getTemplateData(
      Object.assign(data, { assets, mountpoint, globals, fragments })
    );
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
